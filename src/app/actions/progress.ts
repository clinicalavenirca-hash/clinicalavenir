'use server';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { requireStudent } from '@/lib/db/session';

export async function markVideoWatched(videoId: string) {
  const me = await requireStudent();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa
    .from('video_progress')
    .upsert({ user_id: me.id, video_id: videoId, watched_at: new Date().toISOString() }, { onConflict: 'user_id,video_id' });
  if (error) return { error: error.message };
  revalidatePath('/student/dashboard');
  return { ok: true };
}

export async function completeModule(moduleId: string) {
  const me = await requireStudent();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa
    .from('module_progress')
    .upsert({ user_id: me.id, module_id: moduleId, completed_at: new Date().toISOString() }, { onConflict: 'user_id,module_id' });
  if (error) return { error: error.message };
  revalidatePath('/student/dashboard');
  return { ok: true };
}
