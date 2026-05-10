import type { LearningStatus } from '@/lib/data';
import { supabaseServer } from '@/lib/supabase/server';

type Row = {
  user_id: string;
  course_id: string;
  course_slug: string;
  course_title: string;
  modules_total: number;
  modules_completed: number;
  videos_total: number;
  videos_watched: number;
  last_watched_at: string | null;
};

export async function fetchLearningStatus(userId: string): Promise<LearningStatus[]> {
  const supa = supabaseServer();
  if (!supa) return [];
  const { data, error } = await supa.from('learning_status').select('*').eq('user_id', userId);
  if (error) { console.error('[fetchLearningStatus]', error.message); return []; }
  return (data as Row[]).map((r) => ({
    courseId: r.course_id,
    courseSlug: r.course_slug,
    courseTitle: r.course_title,
    modulesTotal: r.modules_total ?? 0,
    modulesCompleted: r.modules_completed ?? 0,
    videosTotal: r.videos_total ?? 0,
    videosWatched: r.videos_watched ?? 0,
    percent: Math.round(((r.videos_watched ?? 0) / Math.max(1, r.videos_total ?? 0)) * 100),
    lastWatchedAt: r.last_watched_at
  }));
}

/** Returns the slugs of courses the given student is enrolled in. */
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
