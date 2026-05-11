'use server';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/db/session';

/**
 * Public contact form submission — no auth required, RLS allows anon insert.
 * Returns `{ ok: true }` on success or `{ error: string }` for failures.
 */
export async function submitContactMessage(input: {
  fullName: string;
  email: string;
  countryCode: string;
  phone: string;
  topic: string;
  message: string;
}) {
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  if (!input.fullName?.trim() || !input.email?.trim() || !input.message?.trim()) {
    return { error: 'Name, email and message are required.' };
  }

  const { error } = await supa.from('contact_messages').insert({
    full_name: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    country_code: input.countryCode || null,
    phone: input.phone || null,
    topic: input.topic || null,
    message: input.message.trim()
  });
  if (error) return { error: error.message };

  revalidatePath('/admin/messages');
  return { ok: true };
}

/** Admin: mark a message as read / replied / archived. */
export async function setContactMessageStatus(
  id: string,
  status: 'new' | 'read' | 'replied' | 'archived'
) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('contact_messages').update({ status }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/messages');
  return { ok: true };
}

/** Admin: hard delete a message (e.g. spam). */
export async function deleteContactMessage(id: string) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('contact_messages').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/messages');
  return { ok: true };
}
