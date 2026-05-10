import { cache } from 'react';
import type { Course, Schedule, WeekDay } from '@/lib/data';
import { supabaseServer } from '@/lib/supabase/server';

type Row = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  cover: string;
  short_description: string;
  duration: string;
  timings: string;
  schedule: { days?: string[]; from?: string; to?: string; timezone?: string } | null;
  certificate: boolean;
  registration_start: string | null;
  registration_end: string | null;
  cohort_start: string | null;
  total_seats: number;
  seats_remaining: number;
  best_for: string;
  what_you_will_learn: string[] | null;
  audience: string;
  color: string;
  is_published: boolean;
};

const DEFAULT_SCHEDULE: Schedule = { days: [], from: '', to: '', timezone: 'EST' };

function rowToCourse(r: Row): Course {
  const sch = r.schedule ?? {};
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    tagline: r.tagline,
    cover: r.cover,
    shortDescription: r.short_description,
    duration: r.duration,
    timings: r.timings,
    schedule: {
      days: ((sch.days ?? []) as WeekDay[]),
      from: sch.from ?? '',
      to: sch.to ?? '',
      timezone: sch.timezone ?? DEFAULT_SCHEDULE.timezone
    },
    certificate: r.certificate,
    registrationStart: r.registration_start ?? '',
    registrationEnd: r.registration_end ?? '',
    cohortStart: r.cohort_start ?? '',
    totalSeats: r.total_seats,
    seatsRemaining: r.seats_remaining,
    bestFor: r.best_for,
    whatYouWillLearn: r.what_you_will_learn ?? [],
    audience: r.audience,
    color: r.color
  };
}

export const fetchCourses = cache(async (): Promise<Course[]> => {
  const supa = supabaseServer();
  if (!supa) return [];
  const { data, error } = await supa
    .from('courses')
    .select('*')
    .eq('is_published', true)
    // Hide past-deadline cohorts from the public site. Courses with no
    // registration deadline set (`null`) keep showing.
    .or(`registration_end.is.null,registration_end.gte.${new Date().toISOString().slice(0, 10)}`)
    .order('cohort_start', { ascending: true });
  if (error) { console.error('[fetchCourses]', error.message); return []; }
  return (data as Row[]).map(rowToCourse);
});

/** Includes unpublished — used by admin list. */
export const fetchAllCourses = cache(async (): Promise<Course[]> => {
  const supa = supabaseServer();
  if (!supa) return [];
  const { data, error } = await supa.from('courses').select('*').order('created_at', { ascending: false });
  if (error) { console.error('[fetchAllCourses]', error.message); return []; }
  return (data as Row[]).map(rowToCourse);
});

export const fetchCourseBySlug = cache(async (slug: string): Promise<Course | null> => {
  const supa = supabaseServer();
  if (!supa) return null;
  const { data, error } = await supa.from('courses').select('*').eq('slug', slug).maybeSingle();
  if (error || !data) return null;
  return rowToCourse(data as Row);
});

export const fetchCourseById = cache(async (id: string): Promise<Course | null> => {
  const supa = supabaseServer();
  if (!supa) return null;
  const { data, error } = await supa.from('courses').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return rowToCourse(data as Row);
});
