import { supabaseServer } from '@/lib/supabase/server';

/**
 * Returns the slugs of courses the given student is enrolled in. Kept
 * after the careers-only pivot because the job board, AI resume tailor,
 * interview-prep filter, and the public Apply form all need to know which
 * tracks the student is tagged with.
 *
 * Learning-progress helpers (fetchLearningStatus + the underlying
 * learning_status view) are gone — see migration-012.sql.
 */
export async function fetchEnrolledCourseSlugs(userId: string): Promise<string[]> {
  const supa = supabaseServer();
  if (!supa) return [];
  const { data, error } = await supa
    .from('enrollments')
    .select('course:courses(slug)')
    .eq('user_id', userId);
  if (error) { console.error('[fetchEnrolledCourseSlugs]', error.message); return []; }
  return ((data ?? []) as unknown as { course: { slug: string } | null }[])
    .map((e) => e.course?.slug)
    .filter(Boolean) as string[];
}
