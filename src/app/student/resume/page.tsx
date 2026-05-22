import { requireStudent } from '@/lib/db/session';
import { fetchJobs } from '@/lib/db/jobs';
import { fetchEnrolledCourseSlugs } from '@/lib/db/progress';
import { ResumeBuilder } from '@/components/student/ResumeBuilder';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const me = await requireStudent();
  const [jobs, enrolled] = await Promise.all([
    fetchJobs(),
    fetchEnrolledCourseSlugs(me.id)
  ]);
  // Only jobs in the student's enrolled tracks are eligible for AI tailoring,
  // matching the job-board filter so the dropdown is consistent.
  const visibleJobs = jobs.filter((j) => enrolled.includes(j.courseSlug));
  return <ResumeBuilder profile={me} jobs={visibleJobs} />;
}
