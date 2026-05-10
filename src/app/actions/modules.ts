'use server';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/db/session';

/** Strip a YouTube link or ID down to the 11-char video id. */
function normaliseYouTubeId(input: string): string {
  const trimmed = input.trim();
  // 11-char id?
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  // try to pull v= or short youtu.be/ID or /embed/ID
  const m =
    trimmed.match(/[?&]v=([A-Za-z0-9_-]{11})/) ||
    trimmed.match(/youtu\.be\/([A-Za-z0-9_-]{11})/) ||
    trimmed.match(/\/embed\/([A-Za-z0-9_-]{11})/) ||
    trimmed.match(/\/shorts\/([A-Za-z0-9_-]{11})/);
  return m ? m[1] : trimmed;
}

export type ModuleInput = {
  courseId: string;
  title: string;
  description: string;
  weekLabel: string;
  topics: string[];
};

export async function createModule(input: ModuleInput) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  if (!input.courseId || !input.title?.trim()) return { error: 'Course and title are required.' };
  const { data: last } = await supa.from('modules').select('order_index').eq('course_id', input.courseId).order('order_index', { ascending: false }).limit(1).maybeSingle();
  const orderIndex = (last?.order_index ?? -1) + 1;
  const { error } = await supa.from('modules').insert({
    course_id: input.courseId,
    title: input.title.trim(),
    description: input.description ?? '',
    week_label: input.weekLabel ?? '',
    topics: input.topics ?? [],
    order_index: orderIndex
  });
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${input.courseId}/modules`);
  return { ok: true };
}

export async function updateModule(id: string, courseId: string, input: Omit<ModuleInput, 'courseId'>) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('modules').update({
    title: input.title.trim(),
    description: input.description,
    week_label: input.weekLabel,
    topics: input.topics
  }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}/modules`);
  return { ok: true };
}

export async function deleteModule(id: string, courseId: string) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('modules').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}/modules`);
  return { ok: true };
}

export type VideoInput = {
  moduleId: string;
  title: string;
  youtube: string;        // raw URL or ID
  durationLabel: string;
  description?: string;
};

export async function createVideo(input: VideoInput, courseId: string) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  if (!input.moduleId || !input.title?.trim() || !input.youtube?.trim()) {
    return { error: 'Title and YouTube link are required.' };
  }
  const { data: last } = await supa.from('videos').select('order_index').eq('module_id', input.moduleId).order('order_index', { ascending: false }).limit(1).maybeSingle();
  const orderIndex = (last?.order_index ?? -1) + 1;
  const { error } = await supa.from('videos').insert({
    module_id: input.moduleId,
    title: input.title.trim(),
    youtube_id: normaliseYouTubeId(input.youtube),
    duration_label: input.durationLabel ?? '',
    description: input.description ?? '',
    order_index: orderIndex
  });
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}/modules`);
  return { ok: true };
}

export async function updateVideo(id: string, courseId: string, input: Omit<VideoInput, 'moduleId'>) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('videos').update({
    title: input.title.trim(),
    youtube_id: normaliseYouTubeId(input.youtube),
    duration_label: input.durationLabel,
    description: input.description
  }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}/modules`);
  return { ok: true };
}

export async function deleteVideo(id: string, courseId: string) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('videos').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}/modules`);
  return { ok: true };
}

export async function reorderVideo(id: string, courseId: string, direction: 'up' | 'down') {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { data: target } = await supa.from('videos').select('id, module_id, order_index').eq('id', id).maybeSingle();
  if (!target) return { error: 'Video not found' };
  const op = direction === 'up' ? 'lt' : 'gt';
  const order = direction === 'up' ? { ascending: false } : { ascending: true };
  const { data: neighbour } = await supa
    .from('videos')
    .select('id, order_index')
    .eq('module_id', target.module_id)
    [op]('order_index', target.order_index)
    .order('order_index', order)
    .limit(1)
    .maybeSingle();
  if (!neighbour) return { ok: true };
  await supa.from('videos').update({ order_index: neighbour.order_index }).eq('id', target.id);
  await supa.from('videos').update({ order_index: target.order_index }).eq('id', neighbour.id);
  revalidatePath(`/admin/courses/${courseId}/modules`);
  return { ok: true };
}
