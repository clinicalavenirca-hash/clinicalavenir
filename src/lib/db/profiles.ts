import type { Profile } from '@/lib/data';
import { supabaseServer } from '@/lib/supabase/server';

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

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const supa = supabaseServer();
  if (!supa) return null;
  const { data, error } = await supa.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error || !data) return null;
  return rowToProfile(data as Row);
}
