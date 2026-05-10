'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

/** Refreshes the current page when the `stories` table changes. */
export function StoriesRealtime() {
  const router = useRouter();
  useEffect(() => {
    const supabase = supabaseBrowser();
    if (!supabase) return;
    const channel = supabase
      .channel('public:stories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, () => {
        router.refresh();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);
  return null;
}
