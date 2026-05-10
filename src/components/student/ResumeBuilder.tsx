'use client';
import { useState } from 'react';
import { Save, Printer, Plus, X, Eye } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

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

export function ResumeBuilder() {
  const [resume, setResume] = useState<Resume>(initial);
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
          <button onClick={() => toast('Resume saved.', 'success')} className="btn-secondary btn-md">
            <Save className="w-4 h-4" /> Save
          </button>
          <button onClick={() => window.print()} className="btn-primary btn-md">
            <Printer className="w-4 h-4" /> Download as PDF
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-5 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto scroll-thin lg:pr-2">
          <section className="card card-pad">
            <h3 className="text-lg font-display font-semibold mb-4">Personal details</h3>
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
            <h3 className="text-lg font-display font-semibold mb-4">Professional summary</h3>
            <textarea rows={4} className="input resize-none" value={resume.summary} onChange={e => set('summary', e.target.value)} />
          </section>

          <section className="card card-pad">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-semibold">Experience</h3>
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-semibold">Education</h3>
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
            <h3 className="text-lg font-display font-semibold mb-4">Skills & certifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">Skills (comma-separated)</label><textarea rows={3} className="input resize-none" value={resume.skills} onChange={e => set('skills', e.target.value)} /></div>
              <div><label className="label">Certifications (one per line)</label><textarea rows={3} className="input resize-none" value={resume.certifications} onChange={e => set('certifications', e.target.value)} /></div>
            </div>
          </section>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-6 self-start">
          <div className="text-xs text-ink-500 mb-2 flex items-center gap-2">
            <Eye className="w-3.5 h-3.5" /> Live preview · A4
          </div>
          <div id="resume-paper" className="bg-white shadow-soft-lg rounded-md aspect-[1/1.414] overflow-y-auto scroll-thin p-8 sm:p-10 text-ink-900 text-[11px] sm:text-xs leading-snug">
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
