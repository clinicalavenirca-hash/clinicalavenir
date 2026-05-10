'use server';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/db/session';
import { formatSchedule } from '@/lib/utils';
import type { Schedule } from '@/lib/data';

export type CourseInput = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  cover: string;
  shortDescription: string;
  duration: string;
  schedule: Schedule;       // structured source of truth
  certificate: boolean;
  registrationStart: string | null;
  registrationEnd: string | null;
  cohortStart: string | null;
  totalSeats: number;
  seatsRemaining: number;
  bestFor: string;
  whatYouWillLearn: string[];
  audience: string;
  color: string;
  isPublished: boolean;
};

function inputToRow(input: CourseInput) {
  return {
    id: input.id,
    slug: input.slug,
    title: input.title,
    tagline: input.tagline,
    cover: input.cover,
    short_description: input.shortDescription,
    duration: input.duration,
    schedule: input.schedule,
    timings: formatSchedule(input.schedule),
    certificate: input.certificate,
    registration_start: input.registrationStart || null,
    registration_end: input.registrationEnd || null,
    cohort_start: input.cohortStart || null,
    total_seats: input.totalSeats,
    seats_remaining: input.seatsRemaining,
    best_for: input.bestFor,
    what_you_will_learn: input.whatYouWillLearn,
    audience: input.audience,
    color: input.color,
    is_published: input.isPublished
  };
}

function revalidateCoursePaths() {
  revalidatePath('/');
  revalidatePath('/courses');
  revalidatePath('/admin/courses');
}

export async function createCourse(input: CourseInput) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  if (!input.slug || !input.title) return { error: 'Slug and title are required.' };
  const { error } = await supa.from('courses').insert(inputToRow(input));
  if (error) return { error: error.message };
  revalidateCoursePaths();
  return { ok: true };
}

export async function updateCourse(id: string, input: CourseInput) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('courses').update(inputToRow(input)).eq('id', id);
  if (error) return { error: error.message };
  revalidateCoursePaths();
  revalidatePath(`/courses/${input.slug}`);
  return { ok: true };
}

export async function deleteCourse(id: string) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('courses').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidateCoursePaths();
  return { ok: true };
}
