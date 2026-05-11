import { cache } from 'react';
import type { FaqRow } from '@/lib/data';
import { supabaseServer } from '@/lib/supabase/server';

type Row = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  order_index: number;
};

function rowToFaq(r: Row): FaqRow {
  return {
    id: r.id,
    question: r.question,
    answer: r.answer,
    category: r.category,
    orderIndex: r.order_index
  };
}

/** Public read — used by FAQ page, course detail page, programs page. */
export const fetchFaqs = cache(async (): Promise<FaqRow[]> => {
  const supa = supabaseServer();
  if (!supa) return [];
  const { data, error } = await supa
    .from('faqs')
    .select('id, question, answer, category, order_index')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) {
    console.error('[fetchFaqs]', error.message);
    return [];
  }
  return ((data ?? []) as Row[]).map(rowToFaq);
});
