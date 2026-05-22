'use server';
import { revalidatePath } from 'next/cache';
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/db/session';

export async function updateStudent(id: string, input: { name: string; phone: string; country: string; city: string; address: string }) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('profiles').update({
    name: input.name,
    phone: input.phone,
    country: input.country,
    city: input.city,
    address: input.address
  }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/students');
  revalidatePath(`/admin/students/${id}`);
  return { ok: true };
}

export async function setStudentStatus(id: string, status: 'active' | 'inactive') {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('profiles').update({ status }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/students');
  revalidatePath(`/admin/students/${id}`);
  return { ok: true };
}

export async function deleteStudent(id: string) {
  await requireAdmin();
  const admin = supabaseAdmin();
  if (!admin) return { error: 'Supabase service role key not configured' };
  // Deleting the auth user cascades to profiles + enrollments + progress (FK on delete cascade)
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return { error: error.message };
  revalidatePath('/admin/students');
  return { ok: true };
}

export async function resetStudentPassword(id: string) {
  await requireAdmin();
  const admin = supabaseAdmin();
  if (!admin) return { error: 'Supabase service role key not configured' };
  const tempPassword = generatePassword();
  const { error } = await admin.auth.admin.updateUserById(id, { password: tempPassword });
  if (error) return { error: error.message };
  return { ok: true, tempPassword };
}

export async function addCourseToStudent(userId: string, courseId: string) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('enrollments').upsert(
    { user_id: userId, course_id: courseId },
    { onConflict: 'user_id,course_id', ignoreDuplicates: true }
  );
  if (error) return { error: error.message };
  revalidatePath(`/admin/students/${userId}`);
  return { ok: true };
}

export async function removeCourseFromStudent(userId: string, courseId: string) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('enrollments').delete().eq('user_id', userId).eq('course_id', courseId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/students/${userId}`);
  return { ok: true };
}

/**
 * Creates a student account directly, without an existing public application.
 * Use when a candidate reaches out off-platform (WhatsApp, email, in person)
 * and admin wants to onboard them right away.
 *
 * Mirrors `createAccountFromApplication`: creates an auth user with admin-
 * chosen password + profile metadata (the `handle_new_user` trigger fills
 * the profile row), then optionally enrols the student in chosen courses
 * by slug so the job board filter has tracks to work with.
 *
 * Returns `{ email, password }` so admin can hand off the credentials.
 */
export async function createStudentDirectly(input: {
  name: string;
  email: string;
  password: string;
  phone: string;
  countryCode: string;
  country: string;
  city: string;
  address: string;
  linkedinUrl: string;
  courseSlugs: string[];
}) {
  await requireAdmin();
  const admin = supabaseAdmin();
  const supa = supabaseServer();
  if (!admin || !supa) return { error: 'Supabase service role key not configured' };

  const email = input.email?.trim().toLowerCase();
  const name = input.name?.trim();
  const password = input.password?.trim();

  if (!name || !email) return { error: 'Name and email are required.' };
  if (!password || password.length < 8) return { error: 'Password must be at least 8 characters.' };

  // 1. Refuse duplicates so we don't silently fail in the auth API.
  const { data: existing } = await supa.from('profiles').select('id').ilike('email', email).maybeSingle();
  if (existing) {
    return { error: 'A profile with this email already exists. Use Reset Password instead.' };
  }

  // 2. Create the auth user. The `handle_new_user` trigger reads this
  //    metadata and seeds the profile row.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      phone: input.phone ?? '',
      country_code: input.countryCode ?? '+1',
      country: input.country ?? '',
      city: input.city ?? '',
      address: input.address ?? '',
      role: 'student'
    }
  });
  if (createErr || !created.user) return { error: createErr?.message ?? 'Could not create user' };

  // 3. linkedin_url is not on the trigger, so set it separately if provided.
  const linkedin = input.linkedinUrl?.trim();
  if (linkedin) {
    await admin.from('profiles').update({ linkedin_url: linkedin }).eq('id', created.user.id);
  }

  // 4. Optionally enrol in courses so the job board filter has tracks.
  const slugs = (input.courseSlugs ?? []).filter(Boolean);
  if (slugs.length > 0) {
    const { data: courses } = await supa.from('courses').select('id, slug').in('slug', slugs);
    if (courses && courses.length) {
      await admin.from('enrollments').insert(
        courses.map((c) => ({ user_id: created.user!.id, course_id: c.id }))
      );
    }
  }

  revalidatePath('/admin/students');
  return { ok: true, email, password };
}

function generatePassword(length = 14): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghjkmnpqrstuvwxyz';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
