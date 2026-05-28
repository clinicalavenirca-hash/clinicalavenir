'use server';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { requireStudent } from '@/lib/db/session';

export async function applyToJob(jobId: string) {
  const me = await requireStudent();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };

  // Server-side deadline guard so a tampered client can't apply to a closed role.
  const { data: job } = await supa.from('jobs').select('deadline, is_published').eq('id', jobId).maybeSingle();
  if (!job?.is_published) return { error: 'This role is no longer accepting applications.' };
  if (job.deadline && job.deadline < new Date().toISOString().slice(0, 10)) {
    return { error: 'The application deadline for this role has passed.' };
  }

  // Snapshot the current resume (if any)
  const { data: resume } = await supa.from('resumes').select('*').eq('user_id', me.id).maybeSingle();
  const snapshot = resume ? { fullName: resume.full_name, pdfName: resume.pdf_name, resumeId: resume.id } : { fullName: me.name, pdfName: `${me.name.replace(/\s+/g, '_')}_resume.pdf` };

  const { error } = await supa.from('job_applications').insert({
    user_id: me.id,
    job_id: jobId,
    status: 'applied',
    resume_snapshot: snapshot
  });
  if (error) return { error: error.message };
  revalidatePath('/student/applications');
  revalidatePath(`/student/jobs/${jobId}`);
  return { ok: true };
}

export async function moveJobApplicationStatus(id: string, status: 'applied' | 'interview' | 'offer' | 'rejected') {
  const me = await requireStudent();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('job_applications').update({ status }).eq('id', id).eq('user_id', me.id);
  if (error) return { error: error.message };
  revalidatePath('/student/applications');
  return { ok: true };
}

export async function updateJobApplicationNotes(id: string, notes: string, followUp: string | null) {
  const me = await requireStudent();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('job_applications').update({ notes, follow_up_date: followUp }).eq('id', id).eq('user_id', me.id);
  if (error) return { error: error.message };
  revalidatePath('/student/applications');
  return { ok: true };
}

export async function deleteJobApplication(id: string) {
  const me = await requireStudent();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('job_applications').delete().eq('id', id).eq('user_id', me.id);
  if (error) return { error: error.message };
  revalidatePath('/student/applications');
  return { ok: true };
}

export async function applyToJobExternal(jobId: string) {
  const me = await requireStudent();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };

  // Get the job to verify it exists and is published
  const { data: job, error: fetchError } = await supa.from('jobs').select('deadline, is_published, apply_url, title, company').eq('id', jobId).maybeSingle();
  
  if (fetchError) {
    console.error('[applyToJobExternal] Fetch error:', fetchError);
    return { error: 'Failed to fetch job details' };
  }
  
  if (!job) return { error: 'Job not found.' };
  if (!job.is_published) return { error: 'This role is no longer accepting applications.' };
  if (!job.apply_url) {
    console.error(`[applyToJobExternal] Job ${jobId} (${job.title} @ ${job.company}) has no apply_url`);
    return { error: 'This job does not have an external apply link.' };
  }
  if (job.deadline && job.deadline < new Date().toISOString().slice(0, 10)) {
    return { error: 'The application deadline for this role has passed.' };
  }

  console.log(`[applyToJobExternal] Job ${jobId} apply_url: ${job.apply_url}`);

  // Snapshot the current resume (if any)
  const { data: resume } = await supa.from('resumes').select('*').eq('user_id', me.id).maybeSingle();
  const snapshot = resume ? { fullName: resume.full_name, pdfName: resume.pdf_name, resumeId: resume.id } : { fullName: me.name, pdfName: `${me.name.replace(/\s+/g, '_')}_resume.pdf` };

  // Check if already applied
  const { data: existing } = await supa.from('job_applications').select('id').eq('user_id', me.id).eq('job_id', jobId).maybeSingle();
  
  if (!existing) {
    const { error } = await supa.from('job_applications').insert({
      user_id: me.id,
      job_id: jobId,
      status: 'applied',
      resume_snapshot: snapshot
    });
    if (error) return { error: error.message };
  }
  
  revalidatePath('/student/applications');
  revalidatePath(`/student/jobs/${jobId}`);
  return { ok: true, redirectUrl: job.apply_url };
}
