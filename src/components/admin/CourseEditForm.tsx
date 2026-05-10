'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Loader2, Save } from 'lucide-react';
import type { Course, WeekDay } from '@/lib/data';
import { ImageUploadField } from '@/components/ui/ImageUploadField';
import { toast } from '@/components/ui/Toast';
import { createCourse, updateCourse, deleteCourse, type CourseInput } from '@/app/actions/courses';
import { formatSchedule, cn } from '@/lib/utils';

const WEEKDAYS: WeekDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMEZONES = ['EST', 'EDT', 'CST', 'PST', 'IST', 'UTC', 'GMT'];

export function CourseEditForm({ course }: { course: Course | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // The slug is the only identifier admin sees. The DB also has `id` (a short
  // foreign-key handle) but we just mirror it from the slug — no separate field
  // for the admin to fill in.
  const [slug, setSlug] = useState(course?.slug ?? '');
  const [title, setTitle] = useState(course?.title ?? '');
  const [tagline, setTagline] = useState(course?.tagline ?? '');
  const [shortDescription, setShortDescription] = useState(course?.shortDescription ?? '');
  const [duration, setDuration] = useState(course?.duration ?? '');
  const [days, setDays] = useState<WeekDay[]>(course?.schedule?.days ?? []);
  const [timeFrom, setTimeFrom] = useState(course?.schedule?.from ?? '');
  const [timeTo, setTimeTo] = useState(course?.schedule?.to ?? '');
  const [timezone, setTimezone] = useState(course?.schedule?.timezone ?? 'EST');
  const [certificate, setCertificate] = useState(course?.certificate ?? false);
  const [registrationStart, setRegistrationStart] = useState(course?.registrationStart ?? '');
  const [registrationEnd, setRegistrationEnd] = useState(course?.registrationEnd ?? '');
  const [cohortStart, setCohortStart] = useState(course?.cohortStart ?? '');
  const [totalSeats, setTotalSeats] = useState<number | ''>(course?.totalSeats ?? '');
  const [seatsRemaining, setSeatsRemaining] = useState<number | ''>(course?.seatsRemaining ?? '');
  const [bestFor, setBestFor] = useState(course?.bestFor ?? '');
  const [audience, setAudience] = useState(course?.audience ?? '');
  const [points, setPoints] = useState<string[]>(course?.whatYouWillLearn ?? []);
  const [cover, setCover] = useState<string | null>(course?.cover || null);
  const [isPublished, setIsPublished] = useState(true);
  const color = course?.color ?? 'from-brand-600 to-brand-800';

  function autoFillFromTitle(t: string) {
    setTitle(t);
    if (!course) {
      const s = t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setSlug(s);
    }
  }

  function buildInput(): CourseInput {
    const cleanSlug = slug.trim();
    return {
      // Existing courses keep their original id; new courses just mirror the slug.
      id: course?.id ?? cleanSlug,
      slug: cleanSlug,
      title: title.trim(),
      tagline: tagline.trim(),
      cover: cover ?? '',
      shortDescription: shortDescription.trim(),
      duration: duration.trim(),
      schedule: { days, from: timeFrom, to: timeTo, timezone },
      certificate,
      registrationStart: registrationStart || null,
      registrationEnd: registrationEnd || null,
      cohortStart: cohortStart || null,
      totalSeats: typeof totalSeats === 'number' ? totalSeats : Number(totalSeats) || 0,
      seatsRemaining: typeof seatsRemaining === 'number' ? seatsRemaining : Number(seatsRemaining) || 0,
      bestFor: bestFor.trim(),
      whatYouWillLearn: points.filter((p) => p.trim()),
      audience: audience.trim(),
      color,
      isPublished
    };
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const input = buildInput();
    if (!input.id || !input.slug || !input.title) {
      toast('ID, slug and title are required.', 'warning');
      return;
    }
    startTransition(async () => {
      const res = course ? await updateCourse(course.id, input) : await createCourse(input);
      if (res?.error) { toast(res.error, 'error'); return; }
      toast(course ? 'Course updated.' : 'Course created.', 'success');
      router.push('/admin/courses');
      router.refresh();
    });
  }

  function onDelete() {
    if (!course) return;
    if (!confirm(`Delete "${course.title}"? This removes its modules, videos, and student access.`)) return;
    startTransition(async () => {
      const res = await deleteCourse(course.id);
      if (res?.error) { toast(res.error, 'error'); return; }
      toast('Course deleted.', 'info');
      router.push('/admin/courses');
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 space-y-5">
        <div className="card card-pad">
          <h3 className="text-lg font-display font-semibold mb-4">Basics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="label">Course title *</label><input className="input" value={title} onChange={(e) => autoFillFromTitle(e.target.value)} placeholder="e.g. Pharmacovigilance" /></div>
            <div className="sm:col-span-2"><label className="label">Tagline</label><input className="input" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="One short line that sells the program" /></div>
            <div className="sm:col-span-2"><label className="label">Short description *</label><textarea rows={3} className="input resize-none" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} /></div>
            <div className="sm:col-span-2">
              <label className="label">URL slug *</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-500 whitespace-nowrap">/courses/</span>
                <input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="pharmacovigilance" />
              </div>
              <p className="helper">This is the URL students see. We auto-fill it from the title — change it if you need a custom URL.</p>
            </div>
            <div><label className="label">Duration *</label><input className="input" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="8 weeks" /></div>
          </div>
        </div>

        <div className="card card-pad">
          <h3 className="text-lg font-display font-semibold mb-1">Class schedule</h3>
          <p className="text-sm text-ink-500 mb-4">Pick the days and the live-class time. The public site will show <strong className="text-ink-700">{formatSchedule({ days, from: timeFrom, to: timeTo, timezone }) || '—'}</strong>.</p>
          <div className="space-y-4">
            <div>
              <label className="label">Days *</label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((d) => {
                  const active = days.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]))}
                      className={cn(
                        'px-3.5 py-2 rounded-full text-sm font-medium transition-colors border',
                        active ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-ink-700 border-ink-200 hover:border-brand-400 hover:bg-brand-50/40'
                      )}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">From *</label>
                <input type="time" step="300" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">To *</label>
                <input type="time" step="300" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Time zone</label>
                <select className="input" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  {TIMEZONES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card card-pad">
          <h3 className="text-lg font-display font-semibold mb-4">Cohort & seats</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Registration opens</label><input type="date" className="input" value={registrationStart} onChange={(e) => setRegistrationStart(e.target.value)} /></div>
            <div><label className="label">Registration deadline</label><input type="date" className="input" value={registrationEnd} onChange={(e) => setRegistrationEnd(e.target.value)} /></div>
            <div><label className="label">Cohort start</label><input type="date" className="input" value={cohortStart} onChange={(e) => setCohortStart(e.target.value)} /></div>
            <div><label className="label">Total seats</label><input type="number" className="input" value={totalSeats} onChange={(e) => setTotalSeats(e.target.value === '' ? '' : Number(e.target.value))} /></div>
            <div><label className="label">Seats remaining</label><input type="number" className="input" value={seatsRemaining} onChange={(e) => setSeatsRemaining(e.target.value === '' ? '' : Number(e.target.value))} /></div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-ink-200 w-full cursor-pointer">
                <input type="checkbox" checked={certificate} onChange={(e) => setCertificate(e.target.checked)} className="rounded text-brand-600 focus:ring-brand-500" />
                <span className="text-sm font-medium text-ink-800">Certificate provided</span>
              </label>
            </div>
          </div>
        </div>

        <div className="card card-pad">
          <h3 className="text-lg font-display font-semibold mb-4">Audience</h3>
          <div className="grid grid-cols-1 gap-4">
            <div><label className="label">Best for</label><textarea rows={2} className="input resize-none" value={bestFor} onChange={(e) => setBestFor(e.target.value)} /></div>
            <div><label className="label">Outcome / &quot;You&apos;ll be ready to be…&quot;</label><textarea rows={2} className="input resize-none" value={audience} onChange={(e) => setAudience(e.target.value)} /></div>
          </div>
        </div>

        <div className="card card-pad">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-semibold">What you&apos;ll learn</h3>
            <button type="button" onClick={() => setPoints((p) => [...p, ''])} className="btn-ghost btn-sm"><Plus className="w-4 h-4" /> Add point</button>
          </div>
          <div className="space-y-2">
            {points.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 grid place-items-center text-xs font-semibold flex-shrink-0">{i + 1}</span>
                <input className="input" value={p} onChange={(e) => setPoints((all) => all.map((x, idx) => (idx === i ? e.target.value : x)))} placeholder="e.g. ICH-GCP and Health Canada framework" />
                <button type="button" onClick={() => setPoints((all) => all.filter((_, idx) => idx !== i))} className="p-2 rounded-lg hover:bg-rose-50 text-ink-400 hover:text-rose-600"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={pending} className="lg:hidden btn-primary btn-lg w-full justify-center">
          {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {course ? 'Save course' : 'Create course'}
        </button>
      </div>

      <aside className="lg:col-span-4 space-y-5">
        <div className="card card-pad">
          <h3 className="text-lg font-display font-semibold mb-4">Cover image</h3>
          <ImageUploadField bucket="course-covers" folder={slug || 'new'} value={cover} onChange={setCover} aspect="cover" hint="Wide image — landscape orientation looks best." />
        </div>

        <div className="card card-pad">
          <h3 className="text-lg font-display font-semibold">Visibility</h3>
          <label className="mt-4 flex items-center gap-3 p-3 rounded-xl border border-ink-200">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="rounded text-brand-600 focus:ring-brand-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink-900">Published</p>
              <p className="text-xs text-ink-500">Visible on the public courses page</p>
            </div>
          </label>
        </div>

        <button type="submit" disabled={pending} className="hidden lg:flex btn-primary btn-lg w-full justify-center">
          {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {course ? 'Save course' : 'Create course'}
        </button>

        {course && (
          <div className="card card-pad border-rose-100 bg-rose-50/40">
            <h3 className="text-lg font-display font-semibold text-rose-900">Danger zone</h3>
            <p className="mt-2 text-sm text-rose-800">Deleting a course removes all its modules, videos, and student access.</p>
            <button type="button" onClick={onDelete} disabled={pending} className="mt-4 btn-danger btn-sm">Delete course</button>
          </div>
        )}
      </aside>
    </form>
  );
}
