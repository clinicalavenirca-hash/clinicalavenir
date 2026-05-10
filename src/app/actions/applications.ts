'use server';
import { revalidatePath } from 'next/cache';
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/db/session';

/** Public form submission — no auth required, RLS allows anon insert. */
export async function submitApplication(input: {
  fullName: string;
  email: string;
  countryCode: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  message: string;
  courseSlugs: string[];
}) {
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  if (!input.fullName?.trim() || !input.email?.trim() || input.courseSlugs.length === 0) {
    return { error: 'Name, email and at least one course are required.' };
  }

  // Reject any course whose registration window has closed.
  const today = new Date().toISOString().slice(0, 10);
  const { data: courses } = await supa
    .from('courses')
    .select('id, slug, registration_end, is_published')
    .in('slug', input.courseSlugs);
  const closed = (courses ?? []).filter(
    (c) => !c.is_published || (c.registration_end && c.registration_end < today)
  );
  if (closed.length) {
    return { error: `Registration is closed for: ${closed.map((c) => c.slug).join(', ')}` };
  }

  // Detect existing student.
  const { data: existing } = await supa.from('profiles').select('id').eq('email', input.email.toLowerCase()).maybeSingle();

  // If they already have an account, refuse to accept an application for any
  // course they're already enrolled in — saves admin from having to reject
  // duplicates later.
  if (existing) {
    const courseIds = (courses ?? []).map((c) => c.id);
    const { data: existingEnrollments } = await supa
      .from('enrollments')
      .select('course_id')
      .eq('user_id', existing.id)
      .in('course_id', courseIds);
    if (existingEnrollments && existingEnrollments.length > 0) {
      const enrolledIdSet = new Set(existingEnrollments.map((e) => e.course_id));
      const dupSlugs = (courses ?? [])
        .filter((c) => enrolledIdSet.has(c.id))
        .map((c) => c.slug);
      return {
        error: `You're already enrolled in: ${dupSlugs.join(', ')}. Pick a different program.`
      };
    }
  }

  const { error } = await supa.from('applications').insert({
    full_name: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    country_code: input.countryCode,
    phone: input.phone,
    country: input.country,
    city: input.city,
    address: input.address,
    message: input.message,
    course_slugs: input.courseSlugs,
    is_existing: Boolean(existing)
  });
  if (error) return { error: error.message };
  revalidatePath('/admin/applications');
  return { ok: true };
}

export async function setApplicationStatus(id: string, status: 'new' | 'contacted' | 'paid' | 'declined') {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('applications').update({ status }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/applications');
  return { ok: true };
}

export async function deleteApplication(id: string) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('applications').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/applications');
  return { ok: true };
}

/**
 * Creates an auth user from an application snapshot using the password the
 * admin types in (after verifying payment off-platform). Lets the
 * `handle_new_user` trigger materialise the profile row, then enrols the
 * student in the chosen courses. Returns the email + password so the admin
 * can copy and hand them over via WhatsApp / phone.
 */
export async function createAccountFromApplication(applicationId: string, password: string) {
  await requireAdmin();
  const admin = supabaseAdmin();
  const supa = supabaseServer();
  if (!admin || !supa) return { error: 'Supabase service role key not configured' };

  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  const { data: app, error: appErr } = await supa.from('applications').select('*').eq('id', applicationId).maybeSingle();
  if (appErr || !app) return { error: appErr?.message ?? 'Application not found' };

  // 1. Create auth user with the admin's chosen password + metadata so the
  //    trigger fills profile from the application snapshot.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: app.email,
    password,
    email_confirm: true,
    user_metadata: {
      name: app.full_name,
      phone: app.phone,
      country_code: app.country_code,
      country: app.country,
      city: app.city,
      address: app.address,
      role: 'student'
    }
  });
  if (createErr || !created.user) return { error: createErr?.message ?? 'Could not create user' };

  // 2. Enrol in each course (look up id by slug)
  const { data: courses } = await supa.from('courses').select('id, slug').in('slug', app.course_slugs);
  if (courses && courses.length) {
    await admin.from('enrollments').insert(
      courses.map((c) => ({ user_id: created.user!.id, course_id: c.id }))
    );
  }

  // 3. Mark application paid + record the auth user we just minted, so the
  //    "Create account" button hides for THIS application going forward.
  await admin.from('applications')
    .update({ status: 'paid', auth_user_id: created.user.id })
    .eq('id', applicationId);

  revalidatePath('/admin/applications');
  revalidatePath('/admin/students');
  return { ok: true, email: app.email, password };
}

/** Existing student applies for additional courses — append enrollments only. */
export async function addCoursesFromApplication(applicationId: string) {
  await requireAdmin();
  const admin = supabaseAdmin();
  const supa = supabaseServer();
  if (!admin || !supa) return { error: 'Supabase service role key not configured' };

  const { data: app } = await supa.from('applications').select('*').eq('id', applicationId).maybeSingle();
  if (!app) return { error: 'Application not found' };

  const { data: existing } = await supa.from('profiles').select('id').eq('email', app.email).maybeSingle();
  if (!existing) return { error: 'No existing student account for this email' };

  const { data: courses } = await supa.from('courses').select('id, slug').in('slug', app.course_slugs);
  if (courses && courses.length) {
    await admin.from('enrollments').upsert(
      courses.map((c) => ({ user_id: existing.id, course_id: c.id })),
      { onConflict: 'user_id,course_id', ignoreDuplicates: true }
    );
  }
  // Mark paid + link to the existing student so the action button hides on
  // this application card.
  await admin.from('applications')
    .update({ status: 'paid', auth_user_id: existing.id })
    .eq('id', applicationId);
  revalidatePath('/admin/applications');
  revalidatePath('/admin/students');
  return { ok: true };
}

