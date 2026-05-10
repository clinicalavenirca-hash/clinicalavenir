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

function generatePassword(length = 14): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghjkmnpqrstuvwxyz';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
