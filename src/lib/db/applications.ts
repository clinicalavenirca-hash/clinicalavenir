import { cache } from 'react';
import type { Application } from '@/lib/data';
import { supabaseServer } from '@/lib/supabase/server';

type Row = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  country_code: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  course_slugs: string[];
  message: string | null;
  status: 'new' | 'contacted' | 'paid' | 'declined';
  is_existing: boolean;
  auth_user_id: string | null;
  created_at: string;
};

function rowToApplication(r: Row): Application {
  return {
    id: r.id,
    studentName: r.full_name,
    email: r.email,
    phone: r.phone ?? '',
    countryCode: r.country_code ?? '',
    country: r.country ?? '',
    city: r.city ?? '',
    address: r.address ?? '',
    courses: r.course_slugs ?? [],
    status: r.status,
    createdAt: r.created_at,
    isExisting: r.is_existing,
    message: r.message ?? '',
    authUserId: r.auth_user_id
  };
}

export const fetchApplications = cache(async (): Promise<Application[]> => {
  const supa = supabaseServer();
  if (!supa) return [];
  const { data, error } = await supa.from('applications').select('*').order('created_at', { ascending: false });
  if (error) { console.error('[fetchApplications]', error.message); return []; }
  return (data as Row[]).map(rowToApplication);
});
