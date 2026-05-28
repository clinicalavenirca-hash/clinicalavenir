import Link from 'next/link';
import { Plus } from 'lucide-react';
import { fetchAllJobs } from '@/lib/db/jobs';
import { fetchAllCourses } from '@/lib/db/courses';
import { BulkImportJobsModal } from '@/components/admin/BulkImportJobsModal';
import { JobsTableWithBulkDelete } from '@/components/admin/JobsTableWithBulkDelete';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [jobs, courses] = await Promise.all([fetchAllJobs(), fetchAllCourses()]);
  return (
    <>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <span className="eyebrow">Career</span>
          <h1 className="mt-2 text-2xl sm:text-3xl">Jobs</h1>
          <p className="mt-1 text-ink-600">Post roles tagged to a course track. Only enrolled students see relevant listings.</p>
        </div>
        <div className="flex items-center gap-2">
          <BulkImportJobsModal courses={courses} />
          <Link href="/admin/jobs/new" className="btn-primary btn-md"><Plus className="w-4 h-4" strokeWidth={2.5} /> Post a role</Link>
        </div>
      </div>

      <JobsTableWithBulkDelete jobs={jobs} courses={courses} />
    </>
  );
}
