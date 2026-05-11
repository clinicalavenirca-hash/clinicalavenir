'use server';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/db/session';

export type FaqInput = {
  question: string;
  answer: string;
  category: string | null;
  orderIndex: number;
};

function revalidate() {
  revalidatePath('/admin/faqs');
  revalidatePath('/faq');
  revalidatePath('/courses');
  // course detail pages render their own FAQ slice; revalidate them too
  revalidatePath('/courses/[slug]', 'page');
}

export async function createFaq(input: FaqInput) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  if (!input.question?.trim() || !input.answer?.trim()) {
    return { error: 'Question and answer are required.' };
  }
  const { error } = await supa.from('faqs').insert({
    question: input.question.trim(),
    answer: input.answer.trim(),
    category: input.category?.trim() || null,
    order_index: Number.isFinite(input.orderIndex) ? input.orderIndex : 100
  });
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

export async function updateFaq(id: string, input: FaqInput) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa
    .from('faqs')
    .update({
      question: input.question.trim(),
      answer: input.answer.trim(),
      category: input.category?.trim() || null,
      order_index: Number.isFinite(input.orderIndex) ? input.orderIndex : 100
    })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

export async function deleteFaq(id: string) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('faqs').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}
