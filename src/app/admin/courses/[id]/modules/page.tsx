import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { fetchCourseById } from '@/lib/db/courses';
import { fetchCourseCurriculumById } from '@/lib/db/modules';
import { ModuleManager } from '@/components/admin/ModuleManager';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { id: string } }) {
  const course = await fetchCourseById(params.id);
  if (!course) notFound();
  const modules = await fetchCourseCurriculumById(course.id);

  return (
    <>
      <div className="mb-4">
        <Link href="/admin/courses" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700">
          <ArrowLeft className="w-4 h-4" /> All courses
        </Link>
      </div>
      <div className="mb-6">
        <span className="eyebrow">Curriculum</span>
        <h1 className="mt-2 text-2xl sm:text-3xl">{course.title} — Modules</h1>
        <p className="mt-1 text-ink-600">Add weekly modules and YouTube lessons. Students unlock module N+1 when they complete module N.</p>
      </div>
      <ModuleManager courseId={course.id} modules={modules} />
    </>
  );
}
