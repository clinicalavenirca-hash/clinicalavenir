'use server';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { requireStudent } from '@/lib/db/session';

export async function saveResume(resumeData: {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  experiences: Array<{ role: string; company: string; start: string; end: string; bullets: string }>;
  education: Array<{ degree: string; school: string; years: string; notes: string }>;
  skills: string;
  certifications: string;
}) {
  const me = await requireStudent();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };

  // Check if resume exists
  const { data: existing } = await supa.from('resumes').select('id').eq('user_id', me.id).maybeSingle();

  const pdfName = `${resumeData.fullName.replace(/\s+/g, '_')}_resume.pdf`;
  const resumeContent = JSON.stringify(resumeData);

  if (existing) {
    // Update existing resume
    const { error } = await supa.from('resumes').update({
      full_name: resumeData.fullName,
      pdf_name: pdfName,
      content: resumeContent,
      updated_at: new Date().toISOString()
    }).eq('id', existing.id);
    if (error) return { error: error.message };
  } else {
    // Create new resume
    const { error } = await supa.from('resumes').insert({
      user_id: me.id,
      full_name: resumeData.fullName,
      pdf_name: pdfName,
      content: resumeContent
    });
    if (error) return { error: error.message };
  }

  revalidatePath('/student/resume');
  return { ok: true };
}

export async function getResume() {
  const me = await requireStudent();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };

  const { data, error } = await supa.from('resumes').select('*').eq('user_id', me.id).maybeSingle();
  if (error) {
    console.error('[getResume] Error:', error);
    return { error: error.message };
  }
  
  if (!data) return { ok: true, resume: null };

  let content = null;
  try {
    content = JSON.parse(data.content || '{}');
  } catch (e) {
    console.error('[getResume] Failed to parse resume content:', e);
  }

  return { ok: true, resume: { id: data.id, ...content } };
}

export async function getApplicantResume(applicationId: string) {
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };

  // First get the application
  const { data: app, error: appError } = await supa
    .from('job_applications')
    .select('resume_snapshot')
    .eq('id', applicationId)
    .maybeSingle();
  
  if (appError) return { error: appError.message };
  if (!app) return { error: 'Application not found' };

  const snapshot = app.resume_snapshot as any;
  if (!snapshot?.resumeId) {
    return { 
      ok: true, 
      resume: snapshot, 
      placeholder: true 
    };
  }

  // Get the full resume from resumes table
  const { data: resume, error: resumeError } = await supa
    .from('resumes')
    .select('*')
    .eq('id', snapshot.resumeId)
    .maybeSingle();
  
  if (resumeError) {
    console.error('[getApplicantResume] Error fetching resume:', resumeError);
    return { 
      ok: true, 
      resume: snapshot, 
      placeholder: true 
    };
  }

  if (!resume) {
    return { 
      ok: true, 
      resume: snapshot, 
      placeholder: true 
    };
  }

  let content = null;
  try {
    content = JSON.parse(resume.content || '{}');
  } catch (e) {
    console.error('[getApplicantResume] Failed to parse resume content:', e);
  }

  return { 
    ok: true, 
    resume: content || snapshot, 
    pdfName: resume.pdf_name,
    fullName: resume.full_name
  };
}
