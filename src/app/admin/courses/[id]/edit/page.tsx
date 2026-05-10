import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { fetchCourseById } from '@/lib/db/courses';
import { CourseEditForm } from '@/components/admin/CourseEditForm';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { id: string } }) {
  const course = await fetchCourseById(params.id);
  if (!course) notFound();
  return (
    <>
      <div className="mb-4">
        <Link href="/admin/courses" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700">
          <ArrowLeft className="w-4 h-4" /> All courses
        </Link>
      </div>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <span className="eyebrow">Catalog</span>
          <h1 className="mt-2 text-2xl sm:text-3xl">Edit {course.title}</h1>
          <p className="mt-1 text-ink-600">Update fields and save. Changes go live immediately.</p>
        </div>
        <Link href={`/admin/courses/${course.id}/modules`} className="btn-secondary btn-md">Manage modules</Link>
      </div>
      <CourseEditForm course={course} />
    </>
  );
}
