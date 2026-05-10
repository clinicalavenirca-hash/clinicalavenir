'use server';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/db/session';
import { formatSalaryRange } from '@/lib/utils';

export type JobInput = {
  title: string;
  company: string;
  courseSlug: string;
  city: string;
  country: string;
  type: string;
  seniority: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPeriod: 'year' | 'hour';
  deadline: string | null;
  entryLevelFriendly: boolean;
  description: string;
  qualifications: string[];
  isPublished: boolean;
};

function inputToRow(input: JobInput) {
  return {
    title: input.title.trim(),
    company: input.company.trim(),
    course_slug: input.courseSlug,
    city: input.city,
    country: input.country,
    type: input.type,
    seniority: input.seniority,
    // Both: structured numbers + a rendered display string for backward-compat
    salary_min: input.salaryMin,
    salary_max: input.salaryMax,
    salary_period: input.salaryPeriod,
    salary: formatSalaryRange(input.salaryMin, input.salaryMax, input.salaryPeriod),
    deadline: input.deadline || null,
    entry_level_friendly: input.entryLevelFriendly,
    description: input.description,
    qualifications: input.qualifications,
    is_published: input.isPublished
  };
}

function revalidateJobPaths() {
  revalidatePath('/admin/jobs');
  revalidatePath('/student/jobs');
}

export async function createJob(input: JobInput) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  if (!input.title?.trim() || !input.company?.trim() || !input.courseSlug) {
    return { error: 'Title, company and course track are required.' };
  }
  const { error } = await supa.from('jobs').insert(inputToRow(input));
  if (error) return { error: error.message };
  revalidateJobPaths();
  return { ok: true };
}

export async function updateJob(id: string, input: JobInput) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('jobs').update(inputToRow(input)).eq('id', id);
  if (error) return { error: error.message };
  revalidateJobPaths();
  revalidatePath(`/student/jobs/${id}`);
  return { ok: true };
}

export async function deleteJob(id: string) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('jobs').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidateJobPaths();
  return { ok: true };
}

/** Admin updates a job applicant's pipeline status. */
export async function updateJobApplicantStatus(id: string, status: 'applied' | 'interview' | 'offer' | 'rejected') {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('job_applications').update({ status }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/jobs');
  return { ok: true };
}
