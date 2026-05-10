'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

/**
 * Subscribes to the two tables a student cares about for "did the admin act?":
 *  - applications (course-application status)
 *  - job_applications (job pipeline status)
 * RLS already filters server-side to the student's own rows, so we just
 * call router.refresh() on any change and the page re-fetches with their data.
 */
export function MyDecisionsRealtime() {
  const router = useRouter();
  useEffect(() => {
    const supabase = supabaseBrowser();
    if (!supabase) return;
    const apps = supabase
      .channel('me:applications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => router.refresh())
      .subscribe();
    const jobs = supabase
      .channel('me:job_applications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_applications' }, () => router.refresh())
      .subscribe();
    const enrols = supabase
      .channel('me:enrollments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enrollments' }, () => router.refresh())
      .subscribe();
    return () => {
      supabase.removeChannel(apps);
      supabase.removeChannel(jobs);
      supabase.removeChannel(enrols);
    };
  }, [router]);
  return null;
}
