import { cache } from 'react';
import type { Story } from '@/lib/data';
import { supabaseServer } from '@/lib/supabase/server';

type Row = {
  id: string;
  name: string;
  placement: string;
  quote: string;
  avatar: string | null;
  order_index: number | null;
};

export const fetchStories = cache(async (): Promise<Story[]> => {
  const supa = supabaseServer();
  if (!supa) return [];
  const { data, error } = await supa
    .from('stories')
    .select('*')
    .order('order_index', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true });
  if (error) { console.error('[fetchStories]', error.message); return []; }
  return (data as Row[]).map((r) => ({
    id: r.id,
    name: r.name,
    placement: r.placement,
    quote: r.quote,
    avatar: r.avatar,
    orderIndex: r.order_index ?? undefined
  }));
});
