'use client';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import type { Job, Course } from '@/lib/data';
import { toast } from '@/components/ui/Toast';
import { createJob, updateJob, deleteJob, type JobInput } from '@/app/actions/jobs';

export function JobEditForm({ job, courses }: { job: Job | null; courses: Course[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(job?.title ?? '');
  const [company, setCompany] = useState(job?.company ?? '');
  const [courseSlug, setCourseSlug] = useState(job?.courseSlug ?? '');
  const [description, setDescription] = useState(job?.description ?? '');
  const [qualifications, setQualifications] = useState((job?.qualifications ?? []).join('\n'));
  const [city, setCity] = useState(job?.city ?? '');
  const [country, setCountry] = useState(job?.country ?? 'Canada');
  const [type, setType] = useState(job?.type ?? 'Full-time');
  const [seniority, setSeniority] = useState(job?.seniority ?? 'Entry-level');
  const [salaryMin, setSalaryMin] = useState<number | ''>(job?.salaryMin ?? '');
  const [salaryMax, setSalaryMax] = useState<number | ''>(job?.salaryMax ?? '');
  const [salaryPeriod, setSalaryPeriod] = useState<'year' | 'hour'>(job?.salaryPeriod ?? 'year');
  const [deadline, setDeadline] = useState(job?.deadline ?? '');
  const [entry, setEntry] = useState(job?.entryLevelFriendly ?? false);
  const [isPublished, setIsPublished] = useState(true);
  const [applyUrl, setApplyUrl] = useState(job?.applyUrl ?? '');

  function buildInput(): JobInput {
    return {
      title: title.trim(),
      company: company.trim(),
      courseSlug,
      description: description.trim(),
      qualifications: qualifications.split('\n').map((q) => q.trim()).filter(Boolean),
      city: city.trim(),
      country: country.trim(),
      type, seniority,
      salaryMin: typeof salaryMin === 'number' ? salaryMin : (salaryMin === '' ? null : Number(salaryMin)),
      salaryMax: typeof salaryMax === 'number' ? salaryMax : (salaryMax === '' ? null : Number(salaryMax)),
      salaryPeriod,
      deadline: deadline || null,
      entryLevelFriendly: entry,
      isPublished,
      applyUrl: applyUrl.trim() ? applyUrl.trim() : null
    };
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const input = buildInput();
    if (!input.title || !input.company || !input.courseSlug) {
      toast('Title, company and course track are required.', 'warning');
      return;
    }
    startTransition(async () => {
      const res = job ? await updateJob(job.id, input) : await createJob(input);
      if (res?.error) { toast(res.error, 'error'); return; }
      toast(job ? 'Role updated.' : 'Role posted.', 'success');
      router.push('/admin/jobs');
      router.refresh();
    });
  }

  function onDelete() {
    if (!job) return;
    if (!confirm(`Delete "${job.title}"? Applicant history for this role will also be removed.`)) return;
    startTransition(async () => {
      const res = await deleteJob(job.id);
      if (res?.error) { toast(res.error, 'error'); return; }
      toast('Role deleted.', 'info');
      router.push('/admin/jobs');
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 space-y-5">
        <div className="card card-pad">
          <h3 className="text-lg font-display font-semibold mb-4">Role basics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="label">Job title *</label><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Clinical Research Associate I" /></div>
            <div><label className="label">Company *</label><input className="input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. IQVIA" /></div>
            <div>
              <label className="label">Course track *</label>
              <select className="input" value={courseSlug} onChange={(e) => setCourseSlug(e.target.value)}>
                <option value="">Select a course…</option>
                {courses.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2"><label className="label">Description *</label><textarea rows={5} className="input resize-none" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <div className="sm:col-span-2"><label className="label">Qualifications (one per line)</label><textarea rows={4} className="input resize-none" value={qualifications} onChange={(e) => setQualifications(e.target.value)} /></div>
          </div>
        </div>

        <div className="card card-pad">
          <h3 className="text-lg font-display font-semibold mb-4">Location & employment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">City *</label><input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Toronto" /></div>
            <div><label className="label">Country *</label><input className="input" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Canada" /></div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
                {['Full-time', 'Part-time', 'Contract', 'Internship'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Seniority</label>
              <select className="input" value={seniority} onChange={(e) => setSeniority(e.target.value)}>
                {['Entry-level', 'Mid-level', 'Senior'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Salary range</label>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-5 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 text-sm pointer-events-none">$</span>
                  <input
                    type="number" min="0" step={salaryPeriod === 'year' ? 1000 : 1}
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={salaryPeriod === 'year' ? '70000' : '25'}
                    className="input pl-7"
                    aria-label="Minimum salary"
                  />
                </div>
                <div className="col-span-1 grid place-items-center text-ink-400 text-sm">to</div>
                <div className="col-span-4 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 text-sm pointer-events-none">$</span>
                  <input
                    type="number" min="0" step={salaryPeriod === 'year' ? 1000 : 1}
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={salaryPeriod === 'year' ? '85000' : '32'}
                    className="input pl-7"
                    aria-label="Maximum salary"
                  />
                </div>
                <div className="col-span-2">
                  <select className="input !pr-7" value={salaryPeriod} onChange={(e) => setSalaryPeriod(e.target.value as 'year' | 'hour')} aria-label="Period">
                    <option value="year">/year</option>
                    <option value="hour">/hour</option>
                  </select>
                </div>
              </div>
              <p className="helper">
                Renders as <strong className="text-ink-700">{(salaryMin !== '' || salaryMax !== '') ? `${salaryMin !== '' ? `$${salaryPeriod === 'year' && Number(salaryMin) >= 1000 ? Math.round(Number(salaryMin) / 1000) + 'k' : salaryMin}` : ''}${salaryMin !== '' && salaryMax !== '' ? ' – ' : ''}${salaryMax !== '' ? `$${salaryPeriod === 'year' && Number(salaryMax) >= 1000 ? Math.round(Number(salaryMax) / 1000) + 'k' : salaryMax}` : ''} ${salaryPeriod === 'year' ? 'CAD' : '/hr CAD'}`.trim() : '— enter at least one value —'}</strong> on the public job card.
              </p>
            </div>
            <div className="sm:col-span-2"><label className="label">Application deadline</label><input type="date" className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></div>
          </div>
        </div>

        <div className="card card-pad">
          <h3 className="text-lg font-display font-semibold mb-2">Application route</h3>
          <p className="text-sm text-ink-600 mb-4">
            Leave the URL empty to use the internal flow — students submit a resume snapshot
            and admin tracks them through the pipeline. Set a URL to send students directly
            to the company&apos;s career page; the &quot;Apply&quot; button on the public listing will open
            that link in a new tab and <strong>no internal application is created</strong>.
          </p>
          <label className="label">External application URL <span className="text-ink-400 font-normal">(optional)</span></label>
          <input
            type="url"
            className="input"
            value={applyUrl}
            onChange={(e) => setApplyUrl(e.target.value)}
            placeholder="https://careers.iqvia.com/jobs/12345"
          />
          {applyUrl.trim() && (
            <p className="mt-3 text-xs text-accent-700 bg-accent-50 ring-1 ring-inset ring-accent-200 rounded-lg px-3 py-2">
              External mode is on. Students applying to this role will be redirected off-platform — you won&apos;t see them in the applicants tracker.
            </p>
          )}
        </div>

        <button type="submit" disabled={pending} className="lg:hidden btn-primary btn-lg w-full justify-center">
          {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {job ? 'Save changes' : 'Post role'}
        </button>
      </div>

      <aside className="lg:col-span-4 space-y-5">
        <div className="card card-pad">
          <h3 className="text-lg font-display font-semibold mb-4">Visibility</h3>
          <label className="flex items-start gap-3 p-3 rounded-xl border border-ink-200 cursor-pointer">
            <input type="checkbox" checked={entry} onChange={(e) => setEntry(e.target.checked)} className="mt-0.5 rounded text-brand-600 focus:ring-brand-500" />
            <div>
              <p className="text-sm font-semibold text-ink-900">Entry-level friendly</p>
              <p className="text-xs text-ink-500 mt-0.5">Show the entry-level badge on the role card.</p>
            </div>
          </label>
          <label className="mt-2 flex items-start gap-3 p-3 rounded-xl border border-ink-200 cursor-pointer">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="mt-0.5 rounded text-brand-600 focus:ring-brand-500" />
            <div>
              <p className="text-sm font-semibold text-ink-900">Published</p>
              <p className="text-xs text-ink-500 mt-0.5">Visible to enrolled students.</p>
            </div>
          </label>
        </div>

        <button type="submit" disabled={pending} className="hidden lg:flex btn-primary btn-lg w-full justify-center">
          {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {job ? 'Save changes' : 'Post role'}
        </button>

        {job && (
          <>
            <div className="card card-pad">
              <h3 className="text-lg font-display font-semibold mb-3">Applicant pipeline</h3>
              <Link href={`/admin/jobs/${job.id}/applicants`} className="btn-secondary btn-md w-full justify-center">View applicants</Link>
            </div>
            <div className="card card-pad border-rose-100 bg-rose-50/40">
              <h3 className="text-lg font-display font-semibold text-rose-900">Danger zone</h3>
              <button type="button" onClick={onDelete} disabled={pending} className="mt-3 btn-danger btn-sm w-full">Delete role</button>
            </div>
          </>
        )}
      </aside>
    </form>
  );
}
