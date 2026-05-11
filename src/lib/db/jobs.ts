import { cache } from 'react';
import type { Job } from '@/lib/data';
import { supabaseServer } from '@/lib/supabase/server';

type Row = {
  id: string;
  title: string;
  company: string;
  course_slug: string;
  city: string | null;
  country: string | null;
  type: string | null;
  seniority: string | null;
  salary: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_period: 'year' | 'hour' | null;
  deadline: string | null;
  entry_level_friendly: boolean;
  description: string | null;
  qualifications: string[] | null;
  posted_at: string;
  is_published: boolean;
  apply_url: string | null;
};

function rowToJob(r: Row): Job {
  return {
    id: r.id,
    title: r.title,
    company: r.company,
    courseSlug: r.course_slug,
    city: r.city ?? '',
    country: r.country ?? '',
    type: r.type ?? '',
    seniority: r.seniority ?? '',
    salary: r.salary ?? '',
    salaryMin: r.salary_min,
    salaryMax: r.salary_max,
    salaryPeriod: r.salary_period ?? 'year',
    deadline: r.deadline ?? '',
    entryLevelFriendly: r.entry_level_friendly,
    description: r.description ?? '',
    qualifications: r.qualifications ?? [],
    postedAt: r.posted_at,
    applyUrl: r.apply_url ?? null
  };
}

/** Public/student listings: published, posted in the last 30 days, and the
 *  application deadline (if any) hasn't passed. */
export const fetchJobs = cache(async (): Promise<Job[]> => {
  const supa = supabaseServer();
  if (!supa) return [];
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supa
    .from('jobs')
    .select('*')
    .eq('is_published', true)
    .gte('posted_at', cutoff)
    .or(`deadline.is.null,deadline.gte.${today}`)
    .order('posted_at', { ascending: false });
  if (error) { console.error('[fetchJobs]', error.message); return []; }
  return (data as Row[]).map(rowToJob);
});

/** Admin list: every job, including unpublished + stale. */
export const fetchAllJobs = cache(async (): Promise<Job[]> => {
  const supa = supabaseServer();
  if (!supa) return [];
  const { data, error } = await supa.from('jobs').select('*').order('posted_at', { ascending: false });
  if (error) { console.error('[fetchAllJobs]', error.message); return []; }
  return (data as Row[]).map(rowToJob);
});

export const fetchJob = cache(async (id: string): Promise<Job | null> => {
  const supa = supabaseServer();
  if (!supa) return null;
  const { data, error } = await supa.from('jobs').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return rowToJob(data as Row);
});
