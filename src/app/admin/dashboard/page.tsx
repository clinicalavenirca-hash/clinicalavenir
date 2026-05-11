import Link from 'next/link';
import { Inbox, Users, Briefcase, Video, Plus, Activity } from 'lucide-react';
import { supabaseServer } from '@/lib/supabase/server';
import { Reveal } from '@/components/ui/Reveal';
import { ApplicationsRealtime } from '@/components/realtime/ApplicationsRealtime';
import { cn, initials } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Tone = 'badge-accent' | 'badge-brand' | 'badge-success' | 'badge-danger';

/**
 * Why count queries: the dashboard previously fetched the FULL applications,
 * courses, jobs and students tables and then called .length / .filter on the
 * arrays. That's 4 round-trips returning kilobytes of data we never used. This
 * version uses Postgres `count()` with `head: true` (no body returned) so each
 * round-trip is tiny, and they all fly out in parallel.
 */
export default async function AdminDashboardPage() {
  const supa = supabaseServer();

  // Defaults so the page renders even if Supabase isn't reachable.
  let newApps = 0;
  let activeStudents = 0;
  let totalStudents = 0;
  let liveJobs = 0;
  let totalVideos = 0;
  let recentApps: Array<{ id: string; full_name: string; email: string; status: string; courses: string[]; created_at: string; is_existing: boolean }> = [];

  if (supa) {
    const todayIso = new Date().toISOString().slice(0, 10);
    const cutoff30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // 6 parallel lightweight queries instead of 5 full-table fetches.
    const [
      newAppsRes,
      activeStudentsRes,
      totalStudentsRes,
      liveJobsRes,
      totalVideosRes,
      recentAppsRes
    ] = await Promise.all([
      supa.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      supa.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student').eq('status', 'active'),
      supa.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supa
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)
        .gte('posted_at', cutoff30)
        .or(`deadline.is.null,deadline.gte.${todayIso}`),
      supa.from('videos').select('*', { count: 'exact', head: true }),
      // 5 most recent applications, only the columns we render
      supa
        .from('applications')
        .select('id, full_name, email, status, course_slugs, created_at, is_existing')
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    newApps = newAppsRes.count ?? 0;
    activeStudents = activeStudentsRes.count ?? 0;
    totalStudents = totalStudentsRes.count ?? 0;
    liveJobs = liveJobsRes.count ?? 0;
    totalVideos = totalVideosRes.count ?? 0;
    recentApps = (recentAppsRes.data ?? []).map((r: any) => ({
      id: r.id,
      full_name: r.full_name,
      email: r.email,
      status: r.status,
      courses: r.course_slugs ?? [],
      created_at: r.created_at,
      is_existing: r.is_existing
    }));
  }

  const cards = [
    { label: 'New applications', value: newApps,                                   hint: 'Need first contact', tone: 'bg-accent-50 text-accent-700', Icon: Inbox },
    { label: 'Active students',  value: `${activeStudents} / ${totalStudents}`,    hint: 'Active vs total',    tone: 'bg-brand-50 text-brand-700',   Icon: Users },
    { label: 'Live jobs',        value: liveJobs,                                  hint: 'Open right now',     tone: 'bg-emerald-50 text-emerald-700',Icon: Briefcase },
    { label: 'Videos uploaded',  value: totalVideos,                               hint: 'Across all courses', tone: 'bg-brand-50 text-brand-700', Icon: Video }
  ];

  const toneFor = (s: string): Tone =>
    s === 'new'       ? 'badge-accent'  :
    s === 'contacted' ? 'badge-brand'   :
    s === 'paid'      ? 'badge-success' :
                        'badge-danger';

  return (
    <>
      <ApplicationsRealtime />
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <span className="eyebrow">Overview</span>
          <h1 className="mt-2 text-2xl sm:text-3xl">Today at Avenir</h1>
          <p className="mt-1 text-ink-600">A live snapshot of applications, students, and content.</p>
        </div>
        <span className="badge-success"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Realtime</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((c, i) => (
          <Reveal key={c.label} delay={i * 0.04}>
            <div className="stat-card">
              <div>
                <p className="text-xs text-ink-500 font-medium">{c.label}</p>
                <p className="font-display text-2xl sm:text-3xl font-bold mt-1.5 text-ink-900 tabular-nums">{c.value}</p>
                <p className="text-xs text-ink-500 mt-1">{c.hint}</p>
              </div>
              <span className={cn('w-10 h-10 rounded-xl grid place-items-center flex-shrink-0', c.tone)}>
                <c.Icon className="w-5 h-5" />
              </span>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <Reveal as="div" className="lg:col-span-7 card card-pad">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl">Recent applications</h2>
            <Link href="/admin/applications" className="text-sm font-semibold text-brand-700 hover:text-brand-600">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentApps.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-4 p-3 rounded-xl border border-ink-100 hover:border-ink-200 hover:bg-ink-50/50 transition-colors">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center text-xs font-semibold flex-shrink-0">{initials(a.full_name)}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-ink-900 text-sm truncate">{a.full_name}</p>
                      {a.is_existing && <span className="badge-brand text-[10px]">Existing student</span>}
                    </div>
                    <p className="text-xs text-ink-500 mt-0.5">{a.courses.length} course{a.courses.length === 1 ? '' : 's'} · {new Date(a.created_at).toLocaleString('en-CA', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                  </div>
                </div>
                <span className={cn(toneFor(a.status), 'capitalize flex-shrink-0')}>{a.status}</span>
              </div>
            ))}
            {recentApps.length === 0 && <p className="text-sm text-ink-500 text-center py-6">No applications yet — they&apos;ll appear here in realtime when a visitor submits the apply form.</p>}
          </div>
        </Reveal>

        <div className="lg:col-span-5 space-y-4">
          <Reveal as="div">
            <Link href="/admin/applications" className="card card-pad card-hover flex items-start gap-4">
              <span className="w-12 h-12 rounded-xl bg-accent-50 text-accent-700 grid place-items-center flex-shrink-0"><Inbox className="w-6 h-6" /></span>
              <div className="min-w-0">
                <p className="font-semibold text-ink-900">Process applications</p>
                <p className="mt-1 text-sm text-ink-600">{newApps} new application{newApps === 1 ? '' : 's'} waiting on first contact.</p>
              </div>
            </Link>
          </Reveal>
          <Reveal as="div" delay={0.05}>
            <Link href="/admin/courses/new" className="card card-pad card-hover flex items-start gap-4">
              <span className="w-12 h-12 rounded-xl bg-brand-50 text-brand-700 grid place-items-center flex-shrink-0"><Plus className="w-6 h-6" /></span>
              <div className="min-w-0">
                <p className="font-semibold text-ink-900">Create a new course</p>
                <p className="mt-1 text-sm text-ink-600">Add a new program with cover, schedule, and curriculum.</p>
              </div>
            </Link>
          </Reveal>
          <Reveal as="div" delay={0.1}>
            <Link href="/admin/jobs/new" className="card card-pad card-hover flex items-start gap-4">
              <span className="w-12 h-12 rounded-xl bg-brand-50 text-brand-700 grid place-items-center flex-shrink-0"><Activity className="w-6 h-6" /></span>
              <div className="min-w-0">
                <p className="font-semibold text-ink-900">Post a new role</p>
                <p className="mt-1 text-sm text-ink-600">Tag it to a course and only relevant students see it.</p>
              </div>
            </Link>
          </Reveal>
        </div>
      </div>
    </>
  );
}
