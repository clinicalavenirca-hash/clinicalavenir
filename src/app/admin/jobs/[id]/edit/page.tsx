import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { fetchJob } from '@/lib/db/jobs';
import { fetchAllCourses } from '@/lib/db/courses';
import { JobEditForm } from '@/components/admin/JobEditForm';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { id: string } }) {
  const job = await fetchJob(params.id);
  if (!job) notFound();
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
        <h1 className="mt-2 text-2xl sm:text-3xl">Edit role</h1>
        <p className="mt-1 text-ink-600">Updates go live to enrolled students immediately.</p>
      </div>
      <JobEditForm job={job} courses={courses} />
    </>
  );
}
