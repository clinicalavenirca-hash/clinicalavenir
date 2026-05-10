'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

/**
 * Mounts a Supabase realtime channel for the `courses` table and triggers a
 * Next.js server-component refresh whenever a row is inserted, updated, or
 * deleted. Drop it into any server-rendered page that fetches courses.
 *
 * Renders nothing. Silently no-ops when Supabase env vars are not configured.
 */
export function CoursesRealtime() {
  const router = useRouter();
  useEffect(() => {
    const supabase = supabaseBrowser();
    if (!supabase) return;
    const channel = supabase
      .channel('public:courses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
        router.refresh();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);
  return null;
}
