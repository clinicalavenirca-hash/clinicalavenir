import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client used in RSC, server actions, and route handlers.
 * Cookie set/remove are wrapped in try/catch because they throw inside RSC
 * (only middleware/route handlers/server actions can mutate cookies). The
 * actual auth refresh happens in middleware.
 */
export function supabaseServer(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  const cookieStore = cookies();
  return createServerClient(url, anon, {
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) => {
        try { cookieStore.set({ name, value, ...options }); } catch { /* RSC */ }
      },
      remove: (name: string, options: CookieOptions) => {
        try { cookieStore.set({ name, value: '', ...options }); } catch { /* RSC */ }
      }
    }
  });
}

/**
 * Service-role server client. Bypasses RLS. ONLY use for admin operations
 * where the caller has been verified as admin (e.g. inside an action that
 * already called requireAdmin()). NEVER expose to the browser.
 */
export function supabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) return null;
  // Use the same factory but with the service role key; cookies are not
  // relevant for service-role calls.
  return createServerClient(url, service, {
    cookies: { get: () => undefined, set: () => {}, remove: () => {} }
  });
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
