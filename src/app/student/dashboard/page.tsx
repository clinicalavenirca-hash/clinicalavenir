import Link from 'next/link';
import { Play, FileText, GraduationCap, Sparkles } from 'lucide-react';
import { fetchAllCourses } from '@/lib/db/courses';
import { fetchAllJobs } from '@/lib/db/jobs';
import { fetchEnrolledCourseSlugs, fetchLearningStatus } from '@/lib/db/progress';
import { fetchMyJobApplications } from '@/lib/db/jobApplications';
import { fetchMyApplications } from '@/lib/db/myApplications';
import { requireStudent } from '@/lib/db/session';
import { Reveal } from '@/components/ui/Reveal';
import { MyDecisionsRealtime } from '@/components/realtime/MyDecisionsRealtime';
import { DecisionsPanel } from '@/components/student/DecisionsPanel';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const me = await requireStudent();
  const [courses, jobs, enrolled, learning, myJobApps, myCourseApps] = await Promise.all([
    fetchAllCourses(),
    fetchAllJobs(),
    fetchEnrolledCourseSlugs(me.id),
    fetchLearningStatus(me.id),
    fetchMyJobApplications(me.id),
    fetchMyApplications(me.email)
  ]);
  const owned = courses.filter((c) => enrolled.includes(c.slug));
  const progressBySlug = new Map(learning.map((l) => [l.courseSlug, l]));
  // Slugs the student themselves applied for (any status). Anything they're
  // enrolled in that ISN'T here was added directly by admin — surface that
  // with an "Added for you" pill until they start watching.
  const appliedSlugs = new Set(myCourseApps.flatMap((a) => a.courses));

  return (
    <>
      <MyDecisionsRealtime />
      <Reveal>
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-6 sm:p-8 lg:p-10 text-white">
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent-500 blur-3xl" />
          </div>
          <div className="relative grid lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8">
              <p className="text-brand-200 text-sm font-medium">Welcome back</p>
              <h1 className="mt-1 text-white">Hi, {me.name.split(' ')[0]} 👋</h1>
              <p className="mt-3 text-brand-50 max-w-2xl">Pick up where you left off, or jump to today&apos;s session. Your job board has new roles tagged to your tracks.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/student/courses" className="btn-accent btn-md">Continue learning</Link>
                <Link href="/student/jobs" className="btn-secondary btn-md !bg-white/10 !text-white !border-white/30 hover:!bg-white/20">View new jobs</Link>
              </div>
            </div>
            <div className="lg:col-span-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 backdrop-blur rounded-xl p-4"><p className="text-xs text-brand-200">My courses</p><p className="font-display text-2xl font-bold mt-0.5">{owned.length}</p></div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4"><p className="text-xs text-brand-200">Jobs applied</p><p className="font-display text-2xl font-bold mt-0.5">{myJobApps.length}</p></div>
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

      <Reveal>
        <section className="mt-10">
          <div className="flex items-end justify-between mb-5">
            <h2 className="text-xl">Continue learning</h2>
            <Link href="/student/courses" className="text-sm font-semibold text-brand-700 hover:text-brand-600">All courses →</Link>
          </div>
          {owned.length === 0 ? (
            <div className="card card-pad text-center py-12">
              <p className="text-sm text-ink-500">You aren't enrolled in any courses yet. Once admin enrols you, your courses will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {owned.map((c) => {
                const p = progressBySlug.get(c.slug);
                const progress = p?.percent ?? 0;
                const addedForYou = !appliedSlugs.has(c.slug) && !p?.lastWatchedAt;
                return (
                  <Link key={c.id} href={`/student/courses/${c.slug}`} className="card card-hover overflow-hidden flex flex-col group">
                    <div className="relative aspect-video bg-ink-100">
                      {c.cover && /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={c.cover} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/20 to-transparent" />
                      <span className="absolute top-3 left-3 badge bg-white/15 text-white ring-1 ring-white/30 backdrop-blur">{c.duration}</span>
                      {addedForYou && (
                        <span className="absolute top-3 right-3 badge bg-accent-500 text-white ring-1 ring-white/30 backdrop-blur inline-flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Added for you
                        </span>
                      )}
                      <div className="absolute inset-0 grid place-items-center">
                        <span className="w-14 h-14 rounded-full bg-white/95 grid place-items-center shadow-soft-lg group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 text-brand-700 ml-1" fill="currentColor" />
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-base font-semibold leading-snug">{c.title}</h3>
                      <p className="mt-1 text-xs text-ink-500">{p ? `${p.modulesCompleted} / ${p.modulesTotal} modules` : 'Not started'}</p>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-ink-500">{progress}% complete</span>
                          <span className="text-brand-700 font-semibold">{p?.videosWatched ?? 0}/{p?.videosTotal ?? 0} lessons</span>
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-brand-500 to-brand-700" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </Reveal>

      <section className="mt-10 grid lg:grid-cols-12 gap-6">
        <Reveal as="div" className="lg:col-span-7 card card-pad">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl">Active applications</h2>
            <Link href="/student/applications" className="text-sm font-semibold text-brand-700 hover:text-brand-600">Open tracker →</Link>
          </div>
          <div className="space-y-3">
            {myJobApps.slice(0, 4).map((a) => {
              const tone = ({ applied: 'badge-ink', interview: 'badge-brand', offer: 'badge-success', rejected: 'badge-danger' } as const)[a.status];
              return (
                <div key={a.id} className="flex items-center justify-between gap-4 p-3 rounded-xl border border-ink-100 hover:border-ink-200 hover:bg-ink-50/50 transition-colors">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-ink-900 truncate">{a.resumeSnapshotName.replace(/_/g, ' ').replace('.pdf', '')}</p>
                    <p className="text-xs text-ink-500 mt-0.5">Applied {new Date(a.appliedAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <span className={cn(tone, 'capitalize')}>{a.status}</span>
                </div>
              );
            })}
            {myJobApps.length === 0 && <p className="text-sm text-ink-500 text-center py-6">No job applications yet — find roles you like on the Job Board.</p>}
          </div>
        </Reveal>

        <div className="lg:col-span-5 space-y-4">
          <Reveal as="div">
            <Link href="/apply" className="card card-pad card-hover flex items-start gap-4 ring-1 ring-brand-100 bg-brand-50/40">
              <span className="w-12 h-12 rounded-xl bg-brand-600 text-white grid place-items-center flex-shrink-0"><Sparkles className="w-6 h-6" /></span>
              <div className="min-w-0">
                <p className="font-semibold text-ink-900">Apply for another course</p>
                <p className="mt-1 text-sm text-ink-600">Add another track to your account — your details are already filled in. Admin will reach out within 24 hours.</p>
              </div>
            </Link>
          </Reveal>
          <Reveal as="div" delay={0.04}>
            <Link href="/student/resume" className="card card-pad card-hover flex items-start gap-4">
              <span className="w-12 h-12 rounded-xl bg-accent-50 text-accent-700 grid place-items-center flex-shrink-0"><FileText className="w-6 h-6" /></span>
              <div className="min-w-0">
                <p className="font-semibold text-ink-900">Update your resume</p>
                <p className="mt-1 text-sm text-ink-600">Live preview updates as you type. Download as PDF anytime.</p>
              </div>
            </Link>
          </Reveal>
          <Reveal as="div" delay={0.05}>
            <Link href="/student/interview-prep" className="card card-pad card-hover flex items-start gap-4">
              <span className="w-12 h-12 rounded-xl bg-brand-50 text-brand-700 grid place-items-center flex-shrink-0"><GraduationCap className="w-6 h-6" /></span>
              <div className="min-w-0">
                <p className="font-semibold text-ink-900">Prep for interviews</p>
                <p className="mt-1 text-sm text-ink-600">FDA, Health Canada, ICH, GCP — sample answers under each question.</p>
              </div>
            </Link>
          </Reveal>
          <Reveal as="div" delay={0.1} className="card card-pad bg-gradient-to-br from-ink-900 to-ink-800 text-white">
            <p className="text-xs font-semibold text-brand-300 uppercase tracking-wider">Tip</p>
            <p className="mt-2 font-semibold">Apply to 3 roles this week.</p>
            <p className="mt-1 text-sm text-ink-300 leading-relaxed">Applications snowball. The earlier you start, the more interviews you'll have when you finish the program.</p>
            <Link href="/student/jobs" className="mt-4 btn-secondary btn-sm !bg-white/10 !text-white !border-white/20 hover:!bg-white/20">Open job board</Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
