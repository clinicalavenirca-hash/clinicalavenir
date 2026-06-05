import Link from 'next/link';
import { FileText, GraduationCap, ArrowUpRight, BrainCircuit, Briefcase } from 'lucide-react';
import { fetchAllCourses } from '@/lib/db/courses';
import { fetchAllJobs } from '@/lib/db/jobs';
import { fetchMyJobApplications } from '@/lib/db/jobApplications';
import { fetchMyApplications } from '@/lib/db/myApplications';
import { requireStudent } from '@/lib/db/session';
import { Reveal } from '@/components/ui/Reveal';
import { MyDecisionsRealtime } from '@/components/realtime/MyDecisionsRealtime';
import { DecisionsPanel } from '@/components/student/DecisionsPanel';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * Student dashboard. Career-only surface — no course-learning UI. We still
 * fetch courses for DecisionsPanel (it renders course names for applications
 * the student submitted from the public site) and to detect active job
 * applications.
 */
export default async function DashboardPage() {
  const me = await requireStudent();
  const [courses, jobs, myJobApps, myCourseApps] = await Promise.all([
    fetchAllCourses(),
    fetchAllJobs(),
    fetchMyJobApplications(me.id),
    fetchMyApplications(me.email)
  ]);

  const activeApps = myJobApps.filter((a) => a.status === 'interview' || a.status === 'offer').length;

  return (
    <>
      <MyDecisionsRealtime />
      <Reveal>
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-950 via-ink-900 to-brand-900 p-6 sm:p-8 lg:p-10 text-white ring-1 ring-white/10 shadow-soft-xl">
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-accent-500/30 blur-3xl" />
            <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-brand-500/25 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.06),transparent_60%)]" />
          </div>
          <div className="relative grid lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8">
              <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.22em] uppercase text-accent-300">
                <span className="w-6 h-px bg-accent-400" /> Welcome back
              </p>
              <h1 className="mt-2 text-white font-display">
                Hi, {me.name.split(' ')[0]} <span className="text-accent-300">👋</span>
              </h1>
              <p className="mt-3 text-ink-200 max-w-2xl leading-relaxed">
                Find roles tagged to your tracks, tailor your resume to each one, and prep for the
                interview. Your job board is updated daily.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/student/jobs" className="btn-accent btn-md shadow-lg shadow-accent-500/30">View job board</Link>
                <Link href="/student/resume" className="btn-secondary btn-md !bg-white/10 !text-white !border-white/20 backdrop-blur hover:!bg-white/20">
                  Tailor my resume
                </Link>
              </div>
            </div>
            <div className="lg:col-span-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative overflow-hidden bg-white/[0.07] backdrop-blur rounded-2xl p-4 ring-1 ring-white/15">
                  <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-accent-300">Jobs applied</p>
                  <p className="font-display text-3xl font-bold mt-1 text-white">{myJobApps.length}</p>
                </div>
                <div className="relative overflow-hidden bg-white/[0.07] backdrop-blur rounded-2xl p-4 ring-1 ring-white/15">
                  <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-accent-300">In motion</p>
                  <p className="font-display text-3xl font-bold mt-1 text-white">{activeApps}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <DecisionsPanel
        applications={myCourseApps}
        courses={courses}
        jobApplications={myJobApps}
        jobs={jobs}
      />

      <section className="mt-10 grid lg:grid-cols-12 gap-6">
        <Reveal as="div" className="lg:col-span-7 card card-pad">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl">Active applications</h2>
            <Link href="/student/applications" className="text-sm font-semibold text-brand-700 hover:text-brand-600">
              Open tracker →
            </Link>
          </div>
          <div className="space-y-3">
            {myJobApps.slice(0, 4).map((a) => {
              const tone = ({ applied: 'badge-ink', interview: 'badge-brand', offer: 'badge-success', rejected: 'badge-danger' } as const)[a.status];
              return (
                <div key={a.id} className="flex items-center justify-between gap-4 p-3 rounded-xl border border-ink-100 hover:border-ink-200 hover:bg-ink-50/50 transition-colors">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-ink-900 truncate">
                      {a.resumeSnapshotName.replace(/_/g, ' ').replace('.pdf', '')}
                    </p>
                    <p className="text-xs text-ink-500 mt-0.5">
                      Applied {new Date(a.appliedAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <span className={cn(tone, 'capitalize')}>{a.status}</span>
                </div>
              );
            })}
            {myJobApps.length === 0 && (
              <p className="text-sm text-ink-500 text-center py-6">
                No job applications yet — find roles you like on the Job Board.
              </p>
            )}
          </div>
        </Reveal>

        <div className="lg:col-span-5 space-y-4">
          <Reveal as="div">
            <Link href="/student/jobs" className="card card-pad card-hover flex items-start gap-4 ring-1 ring-brand-200/60 bg-gradient-to-br from-brand-50 to-cream-50">
              <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center flex-shrink-0 shadow-md shadow-brand-700/20">
                <Briefcase className="w-6 h-6" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-ink-900">Browse job board</p>
                <p className="mt-1 text-sm text-ink-600">Roles curated to your tracks. Newest first.</p>
              </div>
            </Link>
          </Reveal>
          <Reveal as="div" delay={0.04}>
            <Link href="/student/ai-assistant" className="card card-pad card-hover flex items-start gap-4 ring-1 ring-ink-200/60 bg-gradient-to-br from-ink-50 to-white">
              <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-ink-900 to-ink-950 text-white grid place-items-center flex-shrink-0 shadow-md shadow-ink-900/20">
                <BrainCircuit className="w-6 h-6" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-ink-900">AI Assistant</p>
                <p className="mt-1 text-sm text-ink-600">Tailor a resume or draft a cover letter for any job.</p>
              </div>
            </Link>
          </Reveal>
          <Reveal as="div" delay={0.08}>
            <Link href="/student/resume" className="card card-pad card-hover flex items-start gap-4 ring-1 ring-accent-200/60 bg-gradient-to-br from-accent-50 to-white">
              <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 text-white grid place-items-center flex-shrink-0 shadow-md shadow-accent-500/25">
                <FileText className="w-6 h-6" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-ink-900">Update your resume</p>
                <p className="mt-1 text-sm text-ink-600">Live preview updates as you type. Download as PDF anytime.</p>
              </div>
            </Link>
          </Reveal>
          <Reveal as="div" delay={0.12}>
            <Link href="/student/interview-prep" className="card card-pad card-hover flex items-start gap-4 ring-1 ring-brand-200/60 bg-gradient-to-br from-cream-50 to-white">
              <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white grid place-items-center flex-shrink-0 shadow-md shadow-brand-600/20">
                <GraduationCap className="w-6 h-6" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-ink-900">Prep for interviews</p>
                <p className="mt-1 text-sm text-ink-600">FDA, Health Canada, ICH, GCP — sample answers under each question.</p>
              </div>
            </Link>
          </Reveal>
          <Reveal as="div" delay={0.16} className="relative overflow-hidden card card-pad bg-gradient-to-br from-ink-950 via-ink-900 to-brand-900 text-white ring-1 ring-white/10">
            <div aria-hidden className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-accent-500/20 blur-3xl pointer-events-none" />
            <div className="relative">
              <p className="text-[10px] font-semibold text-accent-300 uppercase tracking-[0.22em]">Tip</p>
              <p className="mt-2 font-semibold text-white">Apply to 3 roles this week.</p>
              <p className="mt-1 text-sm text-ink-300 leading-relaxed">
                Applications snowball. The earlier you start, the more interviews you&apos;ll have next month.
              </p>
              <Link href="/student/jobs" className="mt-4 btn-secondary btn-sm !bg-white/10 !text-white !border-white/20 hover:!bg-white/20">
                Open job board
                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.2} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
