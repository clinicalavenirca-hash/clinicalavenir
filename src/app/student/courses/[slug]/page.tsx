import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { fetchCourseBySlug } from '@/lib/db/courses';
import { fetchCourseCurriculum } from '@/lib/db/modules';
import { fetchEnrolledCourseSlugs } from '@/lib/db/progress';
import { supabaseServer } from '@/lib/supabase/server';
import { requireStudent } from '@/lib/db/session';
import { CoursePlayer } from '@/components/student/CoursePlayer';

export const dynamic = 'force-dynamic';

export default async function StudentCoursePage({ params }: { params: { slug: string } }) {
  const me = await requireStudent();
  const course = await fetchCourseBySlug(params.slug);
  if (!course) notFound();

  // Block access if not enrolled
  const enrolled = await fetchEnrolledCourseSlugs(me.id);
  if (!enrolled.includes(course.slug)) notFound();

  const modules = await fetchCourseCurriculum(course.slug);

  // Progress: which videos and modules has the student completed?
  const supa = supabaseServer();
  let watchedVideoIds: string[] = [];
  let completedModuleIds: string[] = [];
  if (supa) {
    const [{ data: vp }, { data: mp }] = await Promise.all([
      supa.from('video_progress').select('video_id').eq('user_id', me.id),
      supa.from('module_progress').select('module_id').eq('user_id', me.id)
    ]);
    watchedVideoIds = (vp ?? []).map((r) => r.video_id as string);
    completedModuleIds = (mp ?? []).map((r) => r.module_id as string);
  }

  return (
    <>
      <div className="mb-4">
        <Link href="/student/courses" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700">
          <ArrowLeft className="w-4 h-4" /> My courses
        </Link>
      </div>
      <CoursePlayer
        course={course}
        modules={modules}
        watchedVideoIds={watchedVideoIds}
        completedModuleIds={completedModuleIds}
      />
    </>
  );
}
