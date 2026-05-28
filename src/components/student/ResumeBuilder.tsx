'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Save, Printer, Plus, X, Eye, Loader2, ArrowRight, Linkedin, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import type { Profile, Job } from '@/lib/data';
import { tailorResume } from '@/app/actions/ai';
import { saveResume } from '@/app/actions/resumes';

type Experience = { role: string; company: string; start: string; end: string; bullets: string };
type Education  = { degree: string; school: string; years: string; notes: string };

type Resume = {
  fullName: string; title: string; email: string; phone: string; location: string; linkedin: string;
  summary: string; experiences: Experience[]; education: Education[]; skills: string; certifications: string;
};

const initial: Resume = {
  fullName: 'Aarav Mehta',
  title: 'Clinical Research Associate',
  email: 'aarav@example.com',
  phone: '+1 (416) 555-0188',
  location: 'Toronto, ON',
  linkedin: 'linkedin.com/in/aaravmehta',
  summary: 'Pharmacy graduate transitioning into clinical research, with hands-on training in ICH-GCP, Health Canada CTAs, and site monitoring. Detail-oriented, bilingual (EN/HI), and ready for an entry-level CRA role.',
  experiences: [{ role: 'Pharmacy Intern', company: 'Shoppers Drug Mart', start: 'May 2024', end: 'Aug 2024', bullets: 'Counselled 30+ patients daily on prescribed regimens.\nSupported pharmacist with controlled-substance compliance audits.\nReduced wait time by 18% through workflow improvements.' }],
  education: [{ degree: 'B.Pharm', school: 'University of Toronto', years: '2020 – 2024', notes: 'GPA 3.8 / 4.0' }],
  skills: 'ICH-GCP, Health Canada CTAs, MedDRA, Argus (training), Excel, English, Hindi',
  certifications: 'CITI Program — Good Clinical Practice (2026)\nAvenir — Clinical Research Program (in progress)'
};

export function ResumeBuilder({ profile, jobs }: { profile?: Profile; jobs?: Job[] }) {
  const [resume, setResume] = useState<Resume>(() => initial);
  const [savePending, startSave] = useTransition();

  // ---- AI tailor panel state -----------------------------------------------
  const availableJobs = jobs ?? [];
  const [selectedJobId, setSelectedJobId] = useState<string>(availableJobs[0]?.id ?? '');
  const [linkedinDraft, setLinkedinDraft] = useState(profile?.linkedinUrl ?? '');
  const [aiOutput, setAiOutput] = useState('');
  const [aiError, setAiError] = useState('');
  const [aiPending, startAi] = useTransition();
  const selectedJob = availableJobs.find((j) => j.id === selectedJobId) ?? null;
  const linkedinReady = Boolean(linkedinDraft.trim());

  function handleSave() {
    startSave(async () => {
      const result = await saveResume(resume);
      if (result.error) {
        toast(result.error, 'error');
      } else {
        toast('Resume saved successfully!', 'success');
      }
    });
  }

  function runTailor() {
    setAiError('');
    if (!selectedJob) { setAiError('Pick a job from the dropdown first.'); return; }
    if (!linkedinReady) { setAiError('Add your LinkedIn profile URL to continue.'); return; }

    // Compose the current structured resume as a plain-text "current resume"
    // input — the AI uses it as the source of facts and rewrites for the JD.
    const currentResume = [
      `${resume.fullName} — ${resume.title}`,
      `${resume.email} · ${resume.phone} · ${resume.location} · ${linkedinDraft.trim()}`,
      '',
      'SUMMARY',
      resume.summary,
      '',
      'EXPERIENCE',
      ...resume.experiences.map((e) =>
        `${e.role} — ${e.company} (${e.start}${e.end ? ` – ${e.end}` : ''})\n${e.bullets}`
      ),
      '',
      'EDUCATION',
      ...resume.education.map((e) =>
        `${e.degree} — ${e.school} (${e.years})${e.notes ? `\n${e.notes}` : ''}`
      ),
      '',
      'SKILLS',
      resume.skills,
      '',
      'CERTIFICATIONS',
      resume.certifications
    ].filter(Boolean).join('\n');

    const jd = [selectedJob.description, ...(selectedJob.qualifications ?? [])].filter(Boolean).join('\n\n');

    startAi(async () => {
      const res = await tailorResume({
        jobTitle: selectedJob.title,
        company: selectedJob.company,
        jobDescription: jd,
        resume: currentResume
      });
      if (res.error) { setAiError(res.error); return; }
      setAiOutput(res.content ?? '');
      toast('AI-tailored resume ready below. Edit then download.', 'success');
    });
  }

  function downloadAi() {
    if (!aiOutput) return;
    // Open a new window with just the AI text, trigger print → user picks
    // "Save as PDF" in the print dialog. Works in every browser without
    // pulling in a PDF library.
    const win = window.open('', '_blank');
    if (!win) {
      toast('Allow popups to download the PDF.', 'error');
      return;
    }
    const safe = aiOutput.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeName = (resume.fullName || 'resume').replace(/[<>]/g, '');
    win.document.write(`<!doctype html>
<html><head><title>${safeName} — Tailored Resume</title>
<style>
  @page { size: A4; margin: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 24mm 18mm; white-space: pre-wrap; line-height: 1.5; font-size: 11pt; color: #111; }
</style></head><body>${safe}</body></html>`);
    win.document.close();
    win.focus();
    // Slight delay so the new window has time to layout before printing.
    setTimeout(() => win.print(), 80);
  }

  const set = <K extends keyof Resume>(k: K, v: Resume[K]) => setResume(r => ({ ...r, [k]: v }));
  const updateExp = (i: number, patch: Partial<Experience>) => setResume(r => ({ ...r, experiences: r.experiences.map((e, idx) => idx === i ? { ...e, ...patch } : e) }));
  const updateEdu = (i: number, patch: Partial<Education>)  => setResume(r => ({ ...r, education: r.education.map((e, idx) => idx === i ? { ...e, ...patch } : e) }));
  const addExp = () => setResume(r => ({ ...r, experiences: [...r.experiences, { role: '', company: '', start: '', end: '', bullets: '' }] }));
  const addEdu = () => setResume(r => ({ ...r, education: [...r.education, { degree: '', school: '', years: '', notes: '' }] }));
  const rmExp = (i: number) => setResume(r => ({ ...r, experiences: r.experiences.filter((_, idx) => idx !== i) }));
  const rmEdu = (i: number) => setResume(r => ({ ...r, education: r.education.filter((_, idx) => idx !== i) }));

  return (
    <>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <span className="eyebrow">Career</span>
          <h1 className="mt-2 text-2xl sm:text-3xl">Resume Builder</h1>
          <p className="mt-1 text-ink-600">ATS-friendly. Edit on the left, preview on the right. Print to PDF when you&apos;re done.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={savePending} className="btn-secondary btn-md">
            {savePending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {savePending ? 'Saving...' : 'Save'}
          </button>
          <button onClick={() => window.print()} className="btn-primary btn-md">
            <Printer className="w-4 h-4" /> Download as PDF
          </button>
        </div>
      </div>

      {/* ---- AI Tailor panel — top of page ----------------------------- */}
      <section className="card overflow-hidden mb-6 ring-1 ring-ink-200">
        <header className="px-5 sm:px-6 py-3 bg-ink-950 text-white flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-accent-400">AI tailor</p>
            <h3 className="mt-0.5 text-base sm:text-lg font-display font-bold">
              Match this resume to a job in your tracks
            </h3>
          </div>
          <p className="text-xs text-ink-300 max-w-sm">
            Pick a job, the AI rewrites the resume below to mirror the JD using only facts you&apos;ve entered.
          </p>
        </header>

        <div className="p-4 sm:p-5 space-y-4">
          {availableJobs.length === 0 ? (
            <div className="flex items-start gap-2 text-sm text-ink-700 bg-ink-50 ring-1 ring-inset ring-ink-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={2.2} />
              <span>
                No jobs in your tracks right now. Visit the <Link href="/student/jobs" className="font-semibold underline">job board</Link> when new roles drop, then come back to tailor your resume.
              </span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
                <div>
                  <label className="label">Select a job</label>
                  <select
                    className="input"
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                  >
                    {availableJobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title} — {j.company}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={runTailor}
                  disabled={aiPending || !linkedinReady}
                  className="btn-primary btn-md"
                >
                  {aiPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {aiPending ? 'Generating…' : 'Generate tailored resume'}
                  {!aiPending && <ArrowRight className="w-4 h-4" strokeWidth={2.2} />}
                </button>
              </div>

              <div>
                <label className="label">LinkedIn profile</label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" strokeWidth={2} />
                  <input
                    type="url"
                    className="input pl-9"
                    value={linkedinDraft}
                    onChange={(e) => setLinkedinDraft(e.target.value)}
                    placeholder="https://www.linkedin.com/in/your-handle"
                  />
                </div>
                {profile?.linkedinUrl ? (
                  <p className="helper">Pulled from your profile. Edit only if you want to override for this resume.</p>
                ) : (
                  <p className="helper text-rose-600">
                    Your profile doesn&apos;t have a LinkedIn URL saved.{' '}
                    <Link href="/student/profile" className="font-semibold underline">Add it permanently</Link>
                    {' '}or paste it here just for this generation.
                  </p>
                )}
              </div>

              {aiError && (
                <div className="flex items-start gap-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-inset ring-rose-200 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={2.2} />
                  <span>{aiError}</span>
                </div>
              )}

              {aiOutput && (
                <div className="rounded-xl bg-brand-50/40 ring-1 ring-inset ring-brand-200 p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-brand-700">
                      Tailored output — edit then download
                    </p>
                    <button
                      type="button"
                      onClick={downloadAi}
                      className="btn-primary btn-sm"
                    >
                      <Printer className="w-3.5 h-3.5" /> Download as PDF
                    </button>
                  </div>
                  <textarea
                    rows={18}
                    className="input resize-y font-mono text-xs bg-white"
                    value={aiOutput}
                    onChange={(e) => setAiOutput(e.target.value)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-5">
          <section className="card card-pad">
            <h3 className="text-base font-display font-semibold mb-3">Personal details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><label className="label">Full name</label><input className="input" value={resume.fullName} onChange={e => set('fullName', e.target.value)} /></div>
              <div><label className="label">Title / target role</label><input className="input" value={resume.title} onChange={e => set('title', e.target.value)} /></div>
              <div><label className="label">Email</label><input type="email" className="input" value={resume.email} onChange={e => set('email', e.target.value)} /></div>
              <div><label className="label">Phone</label><input type="tel" className="input" value={resume.phone} onChange={e => set('phone', e.target.value)} /></div>
              <div><label className="label">Location</label><input className="input" value={resume.location} onChange={e => set('location', e.target.value)} /></div>
              <div className="sm:col-span-2"><label className="label">LinkedIn</label><input className="input" value={resume.linkedin} onChange={e => set('linkedin', e.target.value)} /></div>
            </div>
          </section>

          <section className="card card-pad">
            <h3 className="text-base font-display font-semibold mb-3">Professional summary</h3>
            <textarea rows={3} className="input resize-none" value={resume.summary} onChange={e => set('summary', e.target.value)} />
          </section>

          <section className="card card-pad">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-display font-semibold">Experience</h3>
              <button onClick={addExp} className="btn-ghost btn-sm"><Plus className="w-4 h-4" /> Add</button>
            </div>
            <div className="space-y-4">
              {resume.experiences.map((e, i) => (
                <div key={i} className="rounded-xl border border-ink-100 p-4 bg-ink-50/40 relative">
                  <button onClick={() => rmExp(i)} className="absolute top-3 right-3 p-1 text-ink-400 hover:text-rose-600"><X className="w-4 h-4" /></button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className="label">Role</label><input className="input" value={e.role} onChange={ev => updateExp(i, { role: ev.target.value })} /></div>
                    <div><label className="label">Company</label><input className="input" value={e.company} onChange={ev => updateExp(i, { company: ev.target.value })} /></div>
                    <div><label className="label">Start</label><input className="input" value={e.start} onChange={ev => updateExp(i, { start: ev.target.value })} placeholder="May 2024" /></div>
                    <div><label className="label">End</label><input className="input" value={e.end} onChange={ev => updateExp(i, { end: ev.target.value })} placeholder="Present" /></div>
                    <div className="sm:col-span-2">
                      <label className="label">Bullet achievements (one per line)</label>
                      <textarea rows={3} className="input resize-none text-sm" value={e.bullets} onChange={ev => updateExp(i, { bullets: ev.target.value })} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card card-pad">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-display font-semibold">Education</h3>
              <button onClick={addEdu} className="btn-ghost btn-sm"><Plus className="w-4 h-4" /> Add</button>
            </div>
            <div className="space-y-4">
              {resume.education.map((e, i) => (
                <div key={i} className="rounded-xl border border-ink-100 p-4 bg-ink-50/40 relative">
                  <button onClick={() => rmEdu(i)} className="absolute top-3 right-3 p-1 text-ink-400 hover:text-rose-600"><X className="w-4 h-4" /></button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className="label">Degree</label><input className="input" value={e.degree} onChange={ev => updateEdu(i, { degree: ev.target.value })} /></div>
                    <div><label className="label">School</label><input className="input" value={e.school} onChange={ev => updateEdu(i, { school: ev.target.value })} /></div>
                    <div><label className="label">Years</label><input className="input" value={e.years} onChange={ev => updateEdu(i, { years: ev.target.value })} placeholder="2018 – 2022" /></div>
                    <div><label className="label">Notes</label><input className="input" value={e.notes} onChange={ev => updateEdu(i, { notes: ev.target.value })} placeholder="GPA, honours, thesis…" /></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card card-pad">
            <h3 className="text-base font-display font-semibold mb-3">Skills & certifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">Skills (comma-separated)</label><textarea rows={2} className="input resize-none" value={resume.skills} onChange={e => set('skills', e.target.value)} /></div>
              <div><label className="label">Certifications (one per line)</label><textarea rows={2} className="input resize-none" value={resume.certifications} onChange={e => set('certifications', e.target.value)} /></div>
            </div>
          </section>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-6 self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto scroll-thin">
          <div className="text-xs text-ink-500 mb-2 flex items-center gap-2">
            <Eye className="w-3.5 h-3.5" /> Live preview · A4
          </div>
          <div id="resume-paper" className="bg-white shadow-soft-lg rounded-md aspect-[1/1.414] overflow-hidden p-8 sm:p-10 text-ink-900 text-[11px] sm:text-xs leading-snug">
            <header className="border-b-2 border-ink-900 pb-4 mb-4">
              <h1 className="font-display font-bold text-2xl text-ink-900 leading-tight">{resume.fullName || 'Your Name'}</h1>
              <p className="text-brand-700 font-semibold mt-1 text-sm">{resume.title || 'Target role'}</p>
              <p className="mt-2 text-ink-600 text-[11px]">
                {[resume.email, resume.phone, resume.location, resume.linkedin].filter(Boolean).join(' · ')}
              </p>
            </header>

            {resume.summary && (
              <section className="mb-4">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-700 mb-1">Summary</h2>
                <p className="text-ink-800 leading-relaxed">{resume.summary}</p>
              </section>
            )}

            {resume.experiences.length > 0 && (
              <section className="mb-4">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-700 mb-2">Experience</h2>
                {resume.experiences.map((e, i) => (
                  <div key={i} className="mb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink-900">{e.role}</p>
                        <p className="text-ink-700">{e.company}</p>
                      </div>
                      <p className="text-ink-500 text-[10px] flex-shrink-0">{[e.start, e.end].filter(Boolean).join(' – ')}</p>
                    </div>
                    <ul className="mt-1.5 list-disc pl-4 text-ink-800 space-y-0.5">
                      {e.bullets.split('\n').filter(Boolean).map((b, bi) => <li key={bi}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </section>
            )}

            {resume.education.length > 0 && (
              <section className="mb-4">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-700 mb-2">Education</h2>
                {resume.education.map((e, i) => (
                  <div key={i} className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink-900">{e.degree}</p>
                      <p className="text-ink-700">{e.school}</p>
                      {e.notes && <p className="text-ink-600 text-[10px] mt-0.5">{e.notes}</p>}
                    </div>
                    <p className="text-ink-500 text-[10px]">{e.years}</p>
                  </div>
                ))}
              </section>
            )}

            {resume.skills && (
              <section className="mb-4">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-700 mb-1">Skills</h2>
                <p className="text-ink-800">{resume.skills}</p>
              </section>
            )}

            {resume.certifications && (
              <section>
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-700 mb-1">Certifications</h2>
                <ul className="list-disc pl-4 text-ink-800 space-y-0.5">
                  {resume.certifications.split('\n').filter(Boolean).map((c, ci) => <li key={ci}>{c}</li>)}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
