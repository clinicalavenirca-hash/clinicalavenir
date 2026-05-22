'use server';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { requireStudent } from '@/lib/db/session';

export async function updateMyProfile(input: {
  name: string;
  phone: string;
  countryCode: string;
  country: string;
  city: string;
  address: string;
  linkedinUrl: string;
}) {
  const me = await requireStudent();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const linkedin = input.linkedinUrl?.trim();
  const { error } = await supa.from('profiles').update({
    name: input.name,
    phone: input.phone,
    country_code: input.countryCode,
    country: input.country,
    city: input.city,
    address: input.address,
    linkedin_url: linkedin ? linkedin : null
  }).eq('id', me.id);
  if (error) return { error: error.message };
  revalidatePath('/student/profile');
  revalidatePath('/student/dashboard');
  revalidatePath('/student/resume');
  return { ok: true };
}

export async function updateMyAvatar(avatarUrl: string | null) {
  const me = await requireStudent();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('profiles').update({ avatar: avatarUrl }).eq('id', me.id);
  if (error) return { error: error.message };
  revalidatePath('/student/profile');
  revalidatePath('/student');
  return { ok: true };
}
