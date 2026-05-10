import { cache } from 'react';
import type { Module } from '@/lib/data';
import { supabaseServer } from '@/lib/supabase/server';

type ModuleRow = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  week_label: string | null;
  topics: string[] | null;
  order_index: number;
};

type VideoRow = {
  id: string;
  module_id: string;
  title: string;
  youtube_id: string;
  duration_label: string | null;
  description: string | null;
  order_index: number;
};

/** All modules + their videos for a given course slug, ordered correctly. */
export const fetchCourseCurriculum = cache(async (courseSlug: string): Promise<Module[]> => {
  const supa = supabaseServer();
  if (!supa) return [];
  // Look up course by slug to get the id
  const { data: course } = await supa.from('courses').select('id').eq('slug', courseSlug).maybeSingle();
  if (!course) return [];
  return fetchCourseCurriculumById(course.id);
});

export const fetchCourseCurriculumById = cache(async (courseId: string): Promise<Module[]> => {
  const supa = supabaseServer();
  if (!supa) return [];
  const { data: modules, error } = await supa
    .from('modules')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });
  if (error) { console.error('[fetchCourseCurriculumById]', error.message); return []; }
  if (!modules || modules.length === 0) return [];

  const moduleIds = (modules as ModuleRow[]).map((m) => m.id);
  const { data: videos } = await supa
    .from('videos')
    .select('*')
    .in('module_id', moduleIds)
    .order('order_index', { ascending: true });
  const byModule = new Map<string, VideoRow[]>();
  for (const v of (videos ?? []) as VideoRow[]) {
    const list = byModule.get(v.module_id) ?? [];
    list.push(v);
    byModule.set(v.module_id, list);
  }

  return (modules as ModuleRow[]).map((m) => ({
    id: m.id,
    courseId: m.course_id,
    week: m.week_label ?? '',
    title: m.title,
    description: m.description ?? '',
    topics: m.topics ?? [],
    orderIndex: m.order_index,
    videos: (byModule.get(m.id) ?? []).map((v) => ({
      id: v.id,
      title: v.title,
      youtube: v.youtube_id,
      duration: v.duration_label ?? '',
      orderIndex: v.order_index,
      description: v.description
    }))
  }));
});
