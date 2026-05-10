import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { fetchAllCourses } from '@/lib/db/courses';
import { JobEditForm } from '@/components/admin/JobEditForm';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const courses = await fetchAllCourses();
  return (
    <>
      <div className="mb-4">
        <Link href="/admin/jobs" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700">
          <ArrowLeft className="w-4 h-4" /> All jobs
        </Link>
      </div>
      <div className="mb-6">
        <span className="eyebrow">Career</span>
        <h1 className="mt-2 text-2xl sm:text-3xl">Post a new role</h1>
        <p className="mt-1 text-ink-600">Tagging this role to a course makes it visible only to students enrolled in that track.</p>
      </div>
      <JobEditForm job={null} courses={courses} />
    </>
  );
}
