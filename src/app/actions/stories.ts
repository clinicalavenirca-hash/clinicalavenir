'use server';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/db/session';

export type StoryInput = {
  name: string;
  placement: string;
  quote: string;
  avatar: string | null;
};

export async function createStory(input: StoryInput) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  if (!input.name?.trim() || !input.placement?.trim() || !input.quote?.trim()) {
    return { error: 'Name, placement and quote are required.' };
  }
  // append at end
  const { data: last } = await supa.from('stories').select('order_index').order('order_index', { ascending: false, nullsFirst: false }).limit(1).maybeSingle();
  const orderIndex = (last?.order_index ?? 0) + 1;
  const { error } = await supa.from('stories').insert({
    name: input.name.trim(),
    placement: input.placement.trim(),
    quote: input.quote.trim(),
    avatar: input.avatar,
    order_index: orderIndex
  });
  if (error) return { error: error.message };
  revalidatePath('/admin/stories');
  revalidatePath('/');
  return { ok: true };
}

export async function updateStory(id: string, input: StoryInput) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('stories').update({
    name: input.name.trim(),
    placement: input.placement.trim(),
    quote: input.quote.trim(),
    avatar: input.avatar
  }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/stories');
  revalidatePath('/');
  return { ok: true };
}

export async function deleteStory(id: string) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('stories').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/stories');
  revalidatePath('/');
  return { ok: true };
}
