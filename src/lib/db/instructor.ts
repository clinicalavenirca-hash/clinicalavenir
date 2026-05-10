import { cache } from 'react';
import type { Instructor } from '@/lib/data';
import { supabaseServer } from '@/lib/supabase/server';

type Row = {
  id: string;
  name: string;
  title: string;
  photo: string;
  short_bio: string;
  long_bio: string;
  years_experience: number;
  role_label: string;
  current_company: string;
  location: string;
  education: string;
  specialization: string;
  past_companies: string[] | null;
};

export const fetchInstructor = cache(async (): Promise<Instructor | null> => {
  const supa = supabaseServer();
  if (!supa) return null;
  const { data, error } = await supa.from('instructor').select('*').eq('id', 'default').maybeSingle();
  if (error || !data) return null;
  const r = data as Row;
  return {
    name: r.name,
    title: r.title,
    photo: r.photo,
    shortBio: r.short_bio,
    longBio: r.long_bio,
    yearsExperience: r.years_experience,
    currentRole: r.role_label,
    currentCompany: r.current_company,
    location: r.location,
    education: r.education,
    specialization: r.specialization,
    pastCompanies: r.past_companies ?? []
  };
});
