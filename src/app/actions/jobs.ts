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
  /** External application URL; when set, internal tracking is bypassed. */
  applyUrl: string | null;
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
    is_published: input.isPublished,
    apply_url: input.applyUrl?.trim() ? input.applyUrl.trim() : null
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

/**
 * Bulk import jobs from a parsed Indeed-scraper spreadsheet. Each row is a
 * thin object (title/company/city/country/applyUrl/postedAt) — the rest of
 * the columns use shared batch defaults (courseSlug + the per-action
 * fallbacks).
 *
 * De-duplicates by `apply_url`: any row whose URL already exists in the
 * jobs table is skipped, so re-uploading the same export is idempotent.
 * Returns counts of inserted vs skipped.
 */
export type BulkJobRow = {
  title: string;
  company: string;
  city: string;
  country: string;
  applyUrl: string;
  postedAt: string | null;
};

export async function bulkImportJobs(input: {
  rows: BulkJobRow[];
  courseSlug: string;
}) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };

  if (!input.courseSlug) return { error: 'Pick a course track for the batch.' };
  if (!input.rows.length) return { error: 'No rows to import.' };

  // Strip rows without a usable title or apply URL — those are noise.
  const cleaned = input.rows
    .map((r) => ({
      title: r.title?.trim() ?? '',
      company: r.company?.trim() ?? '',
      city: r.city?.trim() ?? '',
      country: r.country?.trim() || 'Canada',
      applyUrl: r.applyUrl?.trim() ?? '',
      postedAt: r.postedAt
    }))
    .filter((r) => r.title && r.company && r.applyUrl);

  if (cleaned.length === 0) return { error: 'No rows had a title + company + URL.' };

  // Dedupe by apply_url against existing jobs.
  const urls = cleaned.map((r) => r.applyUrl);
  const { data: existing } = await supa
    .from('jobs')
    .select('apply_url')
    .in('apply_url', urls);
  const seen = new Set((existing ?? []).map((e: { apply_url: string | null }) => e.apply_url ?? ''));

  const toInsert = cleaned.filter((r) => !seen.has(r.applyUrl));
  const skipped = cleaned.length - toInsert.length;

  if (toInsert.length === 0) {
    return { ok: true, inserted: 0, skipped };
  }

  const now = new Date().toISOString();
  const rows = toInsert.map((r) => {
    let postedAt: string;
    if (r.postedAt) {
      const parsed = new Date(r.postedAt);
      postedAt = Number.isNaN(parsed.getTime()) ? now : parsed.toISOString();
    } else {
      postedAt = now;
    }
    return {
      title: r.title,
      company: r.company,
      course_slug: input.courseSlug,
      city: r.city,
      country: r.country,
      type: 'Full-time',
      seniority: 'Entry-level',
      salary_min: null,
      salary_max: null,
      salary_period: 'year',
      salary: '',
      deadline: null,
      entry_level_friendly: false,
      description: 'Imported from Indeed — see external link for the full posting.',
      qualifications: [],
      is_published: true,
      apply_url: r.applyUrl,
      posted_at: postedAt
    };
  });

  const { error } = await supa.from('jobs').insert(rows);
  if (error) return { error: error.message };

  revalidateJobPaths();
  return { ok: true, inserted: rows.length, skipped };
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
