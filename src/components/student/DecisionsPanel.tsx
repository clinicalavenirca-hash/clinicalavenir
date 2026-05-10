import Link from 'next/link';
import { CheckCircle2, XCircle, Clock, MessageCircle, PartyPopper, BookOpen } from 'lucide-react';
import type { Application, Course, JobApplication, Job } from '@/lib/data';
import { cn, formatDate } from '@/lib/utils';

type Props = {
  applications: Application[];
  courses: Course[];
  jobApplications: JobApplication[];
  jobs: Job[];
};

const APP_TONE = {
  new:       { tone: 'badge-ink',     Icon: Clock,         label: 'Awaiting review' },
  contacted: { tone: 'badge-brand',   Icon: MessageCircle, label: 'In conversation' },
  paid:      { tone: 'badge-success', Icon: CheckCircle2,  label: 'Approved · account active' },
  declined:  { tone: 'badge-danger',  Icon: XCircle,       label: 'Declined' }
} as const;

const JOB_TONE = {
  applied:   { tone: 'badge-ink',     Icon: Clock,         label: 'Awaiting review' },
  interview: { tone: 'badge-brand',   Icon: MessageCircle, label: 'You will be contacted within 24h' },
  offer:     { tone: 'badge-success', Icon: PartyPopper,   label: 'Offer received!' },
  rejected:  { tone: 'badge-danger',  Icon: XCircle,       label: 'Better luck next time' }
} as const;

export function DecisionsPanel({ applications, courses, jobApplications, jobs }: Props) {
  // Show course applications submitted in the last 60 days OR with non-paid status
  const visibleCourseApps = applications;
  // Job applications worth highlighting: anything with admin-driven status
  const decidedJobApps = jobApplications.filter((a) => a.status === 'interview' || a.status === 'offer' || a.status === 'rejected');

  if (visibleCourseApps.length === 0 && decidedJobApps.length === 0) return null;

  return (
    <section className="mt-10 grid lg:grid-cols-2 gap-6">
      {visibleCourseApps.length > 0 && (
        <div className="card card-pad">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl flex items-center gap-2"><BookOpen className="w-5 h-5 text-brand-600" /> Course applications</h2>
          </div>
          <ul className="space-y-3">
            {visibleCourseApps.map((a) => {
              const meta = APP_TONE[a.status];
              const labels = a.courses.map((slug) => courses.find((c) => c.slug === slug)?.title ?? slug);
              return (
                <li key={a.id} className="rounded-xl border border-ink-100 p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink-900 text-sm">{labels.join(' · ')}</p>
                      <p className="text-xs text-ink-500 mt-0.5">Submitted {formatDate(a.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <span className={cn(meta.tone, 'flex-shrink-0')}><meta.Icon className="w-3 h-3" /> {meta.label}</span>
                  </div>
                  {a.status === 'paid' && (
                    <p className="mt-3 text-xs text-emerald-700">
                      Your courses are now in <Link href="/student/courses" className="font-semibold underline">My Courses</Link>.
                    </p>
                  )}
                  {a.status === 'declined' && (
                    <p className="mt-3 text-xs text-rose-700">
                      The team couldn&apos;t move ahead with this application. Reach out on <Link href="/contact" className="font-semibold underline">Contact</Link> if you&apos;d like to discuss.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {decidedJobApps.length > 0 && (
        <div className="card card-pad">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl flex items-center gap-2"><PartyPopper className="w-5 h-5 text-accent-600" /> Job application updates</h2>
            <Link href="/student/applications" className="text-sm font-semibold text-brand-700 hover:text-brand-600">Tracker →</Link>
          </div>
          <ul className="space-y-3">
            {decidedJobApps.map((a) => {
              const job = jobs.find((j) => j.id === a.jobId);
              const meta = JOB_TONE[a.status];
              return (
                <li key={a.id} className="rounded-xl border border-ink-100 p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink-900 text-sm">{job?.title ?? 'Job'}</p>
                      <p className="text-xs text-ink-500 mt-0.5">{job?.company} · Applied {formatDate(a.appliedAt)}</p>
                    </div>
                    <span className={cn(meta.tone, 'flex-shrink-0')}><meta.Icon className="w-3 h-3" /> {meta.label}</span>
                  </div>
                  {a.status === 'interview' && <p className="mt-3 text-xs text-brand-700">You will be contacted shortly within 24 hours.</p>}
                  {a.status === 'offer' && <p className="mt-3 text-xs text-emerald-700">Congratulations — the team will be in touch with next steps.</p>}
                  {a.status === 'rejected' && <p className="mt-3 text-xs text-rose-700">Better luck next time. You will be updated as new roles open up.</p>}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
