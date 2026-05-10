import { fetchAllCourses } from '@/lib/db/courses';
import { fetchApplications } from '@/lib/db/applications';
import { ApplicationsInbox } from '@/components/admin/ApplicationsInbox';
import { ApplicationsRealtime } from '@/components/realtime/ApplicationsRealtime';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [applications, courses] = await Promise.all([fetchApplications(), fetchAllCourses()]);
  return (
    <>
      <ApplicationsRealtime />
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <span className="eyebrow">Inbox</span>
          <h1 className="mt-2 text-2xl sm:text-3xl">Applications</h1>
          <p className="mt-1 text-ink-600">New cards appear here in realtime when a visitor submits the apply form.</p>
        </div>
        <span className="badge-success"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Realtime</span>
      </div>
      <ApplicationsInbox applications={applications} courses={courses} />
    </>
  );
}
