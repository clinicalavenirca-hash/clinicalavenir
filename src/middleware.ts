import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

/**
 * Auth + role gate.
 *
 * Performance notes:
 *  - The matcher below scopes us to ONLY protected routes (/admin/*, /student/*).
 *    Public pages (home, /courses, /apply, login pages, etc.) skip middleware
 *    entirely → no auth round-trip, instant load.
 *  - Role is read from the JWT's `app_metadata.role` claim (no DB query). A
 *    Postgres trigger keeps `auth.users.raw_app_meta_data.role` in sync with
 *    `public.profiles.role`. If the claim is missing (very first session
 *    after the trigger ships) we fall back to one DB query.
 */
export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);
  const path = request.nextUrl.pathname;

  // Refreshes session cookies if the access token is expired.
  const { data: { user } } = await supabase.auth.getUser();

  const isAdminRoute   = path.startsWith('/admin') && path !== '/admin-login';
  const isStudentRoute = path.startsWith('/student');

  // Collapse `/admin` and `/student` directly to their dashboards here in the
  // edge — saves a full SSR pass on a server-component `redirect()` plus a
  // second `requireAdmin()` DB round-trip downstream.
  if (path === '/admin')   { const u = request.nextUrl.clone(); u.pathname = '/admin/dashboard';   return NextResponse.redirect(u); }
  if (path === '/student') { const u = request.nextUrl.clone(); u.pathname = '/student/dashboard'; return NextResponse.redirect(u); }

  if (!user) {
    if (isAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin-login';
      url.searchParams.set('next', path);
      return NextResponse.redirect(url);
    }
    if (isStudentRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', path);
      return NextResponse.redirect(url);
    }
    return response();
  }

  // Pull role from the JWT first — set by the sync trigger in migration-003.
  // Fall back to a DB lookup so existing sessions (whose JWT was minted
  // before the trigger) still work.
  let role: string | undefined = (user.app_metadata as { role?: string } | null)?.role;
  if (!role) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    role = profile?.role ?? 'student';
  }

  if (isAdminRoute && role !== 'admin') {
    const url = request.nextUrl.clone();
    url.pathname = '/student/dashboard';
    return NextResponse.redirect(url);
  }
  if (isStudentRoute && role === 'admin') {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/dashboard';
    return NextResponse.redirect(url);
  }

  return response();
}

// Only run on protected routes. Everything else (home, courses, apply, login,
// static assets) skips middleware completely.
export const config = {
  matcher: ['/admin/:path*', '/student/:path*']
};
