import { cache } from 'react';
import type { JobApplication } from '@/lib/data';
import { supabaseServer } from '@/lib/supabase/server';

type Row = {
  id: string;
  user_id: string;
  job_id: string;
  status: 'applied' | 'interview' | 'offer' | 'rejected';
  notes: string | null;
  follow_up_date: string | null;
  applied_at: string;
  resume_snapshot: { fullName?: string; pdfName?: string } | null;
  profile: { name: string; email: string } | null;
};

function rowToJobApplication(r: Row): JobApplication {
  return {
    id: r.id,
    jobId: r.job_id,
    studentName: r.profile?.name ?? '',
    email: r.profile?.email ?? '',
    appliedAt: r.applied_at,
    status: r.status,
    resumeSnapshotName: r.resume_snapshot?.pdfName ?? `${r.profile?.name?.replace(/\s+/g, '_') ?? 'resume'}.pdf`,
    notes: r.notes ?? '',
    followUp: r.follow_up_date ?? ''
  };
}

/** All job applications for the signed-in student. */
export const fetchMyJobApplications = cache(async (userId: string): Promise<JobApplication[]> => {
  const supa = supabaseServer();
  if (!supa) return [];
  const { data, error } = await supa
    .from('job_applications')
    .select('*, profile:profiles(name, email)')
    .eq('user_id', userId)
    .order('applied_at', { ascending: false });
  if (error) { console.error('[fetchMyJobApplications]', error.message); return []; }
  return (data as unknown as Row[]).map(rowToJobApplication);
});

/** All job applications for a single job (admin view). */
export const fetchJobApplicants = cache(async (jobId: string): Promise<JobApplication[]> => {
  const supa = supabaseServer();
  if (!supa) return [];
  const { data, error } = await supa
    .from('job_applications')
    .select('*, profile:profiles(name, email)')
    .eq('job_id', jobId)
    .order('applied_at', { ascending: false });
  if (error) { console.error('[fetchJobApplicants]', error.message); return []; }
  return (data as unknown as Row[]).map(rowToJobApplication);
});

/** All job applications for a single student (admin view). */
export const fetchStudentJobApplications = cache(async (userId: string): Promise<JobApplication[]> => {
  const supa = supabaseServer();
  if (!supa) return [];
  const { data, error } = await supa
    .from('job_applications')
    .select('*, profile:profiles(name, email)')
    .eq('user_id', userId)
    .order('applied_at', { ascending: false });
  if (error) { console.error('[fetchStudentJobApplications]', error.message); return []; }
  return (data as unknown as Row[]).map(rowToJobApplication);
});
