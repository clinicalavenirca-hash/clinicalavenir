import Link from 'next/link';
import { Plus } from 'lucide-react';
import { fetchAllCourses } from '@/lib/db/courses';
import { Reveal } from '@/components/ui/Reveal';
import { CoursesRealtime } from '@/components/realtime/CoursesRealtime';
import { DeleteCourseButton } from '@/components/admin/DeleteCourseButton';
import { formatDate, isCourseRegistrationClosed } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const courses = await fetchAllCourses();
  return (
    <>
      <CoursesRealtime />
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <span className="eyebrow">Catalog</span>
          <h1 className="mt-2 text-2xl sm:text-3xl">Courses</h1>
          <p className="mt-1 text-ink-600">Create new programs, update curriculum, and manage batches.</p>
        </div>
        <Link href="/admin/courses/new" className="btn-primary btn-md"><Plus className="w-4 h-4" strokeWidth={2.5} /> New course</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {courses.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.04} as="article" className="card card-hover overflow-hidden flex flex-col h-full">
            <div className="relative aspect-[16/9] bg-ink-100">
              {c.cover ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={c.cover} alt="" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-ink-400 text-sm">No cover image</div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink-950/75 via-ink-950/30 to-transparent" />
              <span className="absolute top-3 left-3 badge bg-white/15 text-white ring-1 ring-white/30 backdrop-blur">{c.duration || '—'}</span>
              <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                <span className="badge bg-white/95 text-ink-700 text-[11px]">{c.seatsRemaining}/{c.totalSeats} seats</span>
                {isCourseRegistrationClosed(c) && <span className="badge-danger text-[10px]">Registration closed</span>}
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">{c.tagline}</p>
                <h3 className="text-white text-xl font-display font-bold mt-0.5 leading-tight">{c.title}</h3>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <p className="text-sm text-ink-500">{c.timings || '—'}</p>
              <p className="mt-1 text-xs text-ink-500">Batch starts {c.cohortStart ? formatDate(c.cohortStart) : 'TBD'}</p>
              <div className="mt-5 grid grid-cols-3 gap-2">
                <Link href={`/admin/courses/${c.id}/edit`} className="btn-secondary btn-sm justify-center">Edit</Link>
                <Link href={`/admin/courses/${c.id}/modules`} className="btn-secondary btn-sm justify-center">Modules</Link>
                <DeleteCourseButton id={c.id} title={c.title} />
              </div>
            </div>
          </Reveal>
        ))}
        <Reveal as="div" delay={courses.length * 0.04}>
          <Link href="/admin/courses/new" className="card border-2 border-dashed border-ink-200 flex flex-col items-center justify-center p-8 text-center hover:border-brand-400 hover:bg-brand-50/30 transition-colors min-h-[300px] h-full">
            <span className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 grid place-items-center"><Plus className="w-7 h-7" /></span>
            <p className="mt-4 font-semibold text-ink-900">Create a new course</p>
            <p className="mt-1 text-sm text-ink-500">Add a new program with full curriculum.</p>
          </Link>
        </Reveal>
      </div>
    </>
  );
}
