import { fetchJobs } from '@/lib/db/jobs';
import { fetchAllCourses } from '@/lib/db/courses';
import { fetchEnrolledCourseSlugs } from '@/lib/db/progress';
import { requireStudent } from '@/lib/db/session';
import { JobsBoard } from '@/components/student/JobsBoard';

export const dynamic = 'force-dynamic';

export default async function JobsPage() {
  const me = await requireStudent();
  const [jobs, courses, owned] = await Promise.all([fetchJobs(), fetchAllCourses(), fetchEnrolledCourseSlugs(me.id)]);
  const visible = jobs.filter((j) => owned.includes(j.courseSlug));
  const tracks = courses.filter((c) => owned.includes(c.slug));
  return (
    <>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <span className="eyebrow">Career</span>
          <h1 className="mt-2 text-2xl sm:text-3xl">Job Board</h1>
          <p className="mt-1 text-ink-600">Roles tagged to your tracks. Listings older than 30 days are hidden automatically.</p>
        </div>
        <span className="badge-brand">{visible.length} open roles</span>
      </div>
      <JobsBoard jobs={visible} courses={tracks} />
    </>
  );
}
