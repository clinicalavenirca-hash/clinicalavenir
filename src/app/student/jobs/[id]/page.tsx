import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { fetchJob } from '@/lib/db/jobs';
import { fetchCourseBySlug } from '@/lib/db/courses';
import { supabaseServer } from '@/lib/supabase/server';
import { requireStudent } from '@/lib/db/session';
import { initials, formatDate, isJobDeadlinePassed } from '@/lib/utils';
import { ApplyButton } from '@/components/student/ApplyButton';

export const dynamic = 'force-dynamic';

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const me = await requireStudent();
  const job = await fetchJob(params.id);
  if (!job) notFound();
  const course = await fetchCourseBySlug(job.courseSlug);

  let applied = false;
  const supa = supabaseServer();
  if (supa) {
    const { data } = await supa.from('job_applications').select('id').eq('user_id', me.id).eq('job_id', job.id).maybeSingle();
    applied = !!data;
  }

  return (
    <>
      <div className="mb-4">
        <Link href="/student/jobs" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700">
          <ArrowLeft className="w-4 h-4" /> Back to job board
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="card card-pad">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center flex-shrink-0 font-display font-bold text-lg">{initials(job.company)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl">{job.title}</h1>
                  {job.entryLevelFriendly && <span className="badge-accent text-[10px]">Entry-level friendly</span>}
                </div>
                <p className="mt-1 text-ink-600">{job.company} · {job.city}, {job.country}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {course && <span className="badge-brand">{course.title}</span>}
                  {job.type && <span className="badge-ink">{job.type}</span>}
                  {job.seniority && <span className="badge-ink">{job.seniority}</span>}
                  {job.salary && <span className="badge-ink">{job.salary}</span>}
                  {job.deadline && <span className="badge-warning">Apply by {formatDate(job.deadline)}</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="card card-pad">
            <h2 className="text-xl">About the role</h2>
            <p className="mt-3 text-ink-700 leading-relaxed">{job.description}</p>
          </div>

          {job.qualifications.length > 0 && (
            <div className="card card-pad">
              <h2 className="text-xl">Qualifications & requirements</h2>
              <ul className="mt-4 space-y-2.5">
                {job.qualifications.map((q) => (
                  <li key={q} className="flex gap-3 text-ink-700">
                    <Check className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-6 space-y-4">
            <div className="card card-pad">
              <p className="eyebrow">Apply</p>
              {isJobDeadlinePassed(job) ? (
                <>
                  <p className="mt-2 text-sm text-ink-600">The application deadline for this role has passed.</p>
                  <div className="mt-5 px-4 py-2.5 rounded-xl bg-ink-100 text-ink-600 text-center text-sm font-medium">
                    Applications closed
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm text-ink-600">A snapshot of your current resume will be attached to the application. Update your resume first if needed.</p>
                  <div className="mt-5"><ApplyButton jobId={job.id} alreadyApplied={applied} /></div>
                  {!applied && <Link href="/student/resume" className="mt-3 btn-ghost btn-md w-full justify-center text-brand-700">Edit my resume first →</Link>}
                </>
              )}
            </div>
            <div className="card card-pad">
              <p className="font-semibold text-ink-900">Why you might match</p>
              <ul className="mt-3 space-y-2 text-sm text-ink-700">
                <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0" /><span>You own the <strong>{course?.title || 'related'}</strong> track</span></li>
                <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0" /><span>Located in {job.country}</span></li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
