import { cache } from 'react';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import type { Profile } from '@/lib/data';

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country_code: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  avatar: string | null;
  role: 'student' | 'admin';
  status: 'active' | 'inactive';
  joined_at: string;
};

function rowToProfile(r: Row): Profile {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone ?? '',
    countryCode: r.country_code,
    country: r.country,
    city: r.city,
    address: r.address,
    avatar: r.avatar,
    joinedAt: r.joined_at,
    status: r.status
  };
}

/** Returns the signed-in user's profile, or null. Cached per request. */
export const getCurrentProfile = cache(async (): Promise<(Profile & { role: 'student' | 'admin' }) | null> => {
  const supa = supabaseServer();
  if (!supa) return null;
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return null;
  const { data, error } = await supa.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (error || !data) return null;
  const row = data as Row;
  return { ...rowToProfile(row), role: row.role };
});

export async function requireStudent() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login');
  if (profile.role === 'admin') redirect('/admin/dashboard');
  return profile;
}

export async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/admin-login');
  if (profile.role !== 'admin') redirect('/student/dashboard');
  return profile;
}
