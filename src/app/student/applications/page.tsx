import Link from 'next/link';
import { fetchMyJobApplications } from '@/lib/db/jobApplications';
import { fetchJobs } from '@/lib/db/jobs';
import { requireStudent } from '@/lib/db/session';
import { Kanban } from '@/components/student/Kanban';

export const dynamic = 'force-dynamic';

export default async function ApplicationsPage() {
  const me = await requireStudent();
  const [apps, jobs] = await Promise.all([fetchMyJobApplications(me.id), fetchJobs()]);

  return (
    <>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <span className="eyebrow">Career</span>
          <h1 className="mt-2 text-2xl sm:text-3xl">Application Tracker</h1>
          <p className="mt-1 text-ink-600">Drag cards across columns as your applications progress.</p>
        </div>
        <Link href="/student/jobs" className="btn-secondary btn-md">Find more roles</Link>
      </div>

      <Kanban initial={apps} jobs={jobs} />

      <div className="mt-6 card card-pad bg-ink-50/50 grid sm:grid-cols-3 gap-4 text-center text-sm">
        <div>
          <p className="font-display text-2xl font-bold text-ink-900">{apps.length}</p>
          <p className="text-ink-500">Total applications</p>
        </div>
        <div>
          <p className="font-display text-2xl font-bold text-brand-700">{apps.filter((a) => a.status === 'interview').length}</p>
          <p className="text-ink-500">In interview</p>
        </div>
        <div>
          <p className="font-display text-2xl font-bold text-emerald-700">{apps.filter((a) => a.status === 'offer').length}</p>
          <p className="text-ink-500">Offers</p>
        </div>
      </div>
    </>
  );
}
