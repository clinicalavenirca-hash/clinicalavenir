import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { fetchAllCourses } from '@/lib/db/courses';
import { fetchEnrolledCourseSlugs, fetchLearningStatus } from '@/lib/db/progress';
import { requireStudent } from '@/lib/db/session';
import { Reveal } from '@/components/ui/Reveal';

export const dynamic = 'force-dynamic';

export default async function MyCoursesPage() {
  const me = await requireStudent();
  const [courses, enrolled, learning] = await Promise.all([
    fetchAllCourses(),
    fetchEnrolledCourseSlugs(me.id),
    fetchLearningStatus(me.id)
  ]);
  const owned = courses.filter((c) => enrolled.includes(c.slug));
  const progressBySlug = new Map(learning.map((l) => [l.courseSlug, l]));

  return (
    <>
      <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
        <div>
          <span className="eyebrow">Learning</span>
          <h1 className="mt-2 text-2xl sm:text-3xl">My Courses</h1>
          <p className="mt-1 text-ink-600">Pick up where you left off, or jump back to a key concept.</p>
        </div>
        <Link href="/apply" className="btn-primary btn-md">
          <Sparkles className="w-4 h-4" />
          Apply for another course
        </Link>
      </div>

      {owned.length === 0 ? (
        <div className="card card-pad text-center py-12">
          <p className="text-sm text-ink-500 mb-5">You aren&apos;t enrolled in any courses yet. Once admin enrols you, your courses will appear here.</p>
          <Link href="/apply" className="btn-primary btn-md">
            <Sparkles className="w-4 h-4" />
            Apply for a course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {owned.map((c, i) => {
            const p = progressBySlug.get(c.slug);
            const progress = p?.percent ?? 0;
            return (
              <Reveal key={c.id} delay={i * 0.04}>
                <Link href={`/student/courses/${c.slug}`} className="card card-hover overflow-hidden group block">
                  <div className="relative aspect-[16/8] bg-ink-100">
                    {c.cover && /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={c.cover} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/30" />
                    <div className="absolute bottom-4 left-5 right-5">
                      <p className="text-xs font-semibold text-brand-200 uppercase tracking-wider">{c.tagline}</p>
                      <h3 className="text-white text-2xl font-display font-bold mt-1">{c.title}</h3>
                    </div>
                    <span className="absolute top-4 right-4 badge bg-white/15 text-white ring-1 ring-white/30 backdrop-blur">{c.duration}</span>
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink-700">{progress}% complete</span>
                      <span className="text-ink-500">{p?.videosWatched ?? 0} of {p?.videosTotal ?? 0} lessons</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-ink-100 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-sm text-ink-600">{p?.modulesCompleted ?? 0} / {p?.modulesTotal ?? 0} modules</span>
                      <span className="btn-primary btn-sm">Open course</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </>
  );
}
