'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

export function ApplicationsRealtime() {
  const router = useRouter();
  useEffect(() => {
    const supabase = supabaseBrowser();
    if (!supabase) return;
    const channel = supabase
      .channel('public:applications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => {
        router.refresh();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [router]);
  return null;
}
