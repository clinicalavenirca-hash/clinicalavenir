import Link from 'next/link';
import { faqs } from '@/lib/data';
import { fetchCourses } from '@/lib/db/courses';
import { Reveal } from '@/components/ui/Reveal';
import { Accordion } from '@/components/ui/Disclosure';
import { CoursesRealtime } from '@/components/realtime/CoursesRealtime';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  const courses = await fetchCourses();
  return (
    <>
      <CoursesRealtime />
      <section className="hero-gradient">
        <div className="container-app py-14 sm:py-20">
          <div className="max-w-3xl">
            <Reveal><span className="eyebrow">Programs</span></Reveal>
            <Reveal delay={0.04}><h1 className="mt-3">Career programs in pharma & life sciences.</h1></Reveal>
            <Reveal delay={0.08}><p className="mt-4 text-lg text-ink-600">Eight to ten weeks of live instruction, hands-on labs, and a job board curated to your track. Pick the program that matches where you want to land.</p></Reveal>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container-app space-y-6">
          {courses.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.04} as="article" className="card card-hover overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              <div className="relative lg:col-span-4 aspect-[16/10] lg:aspect-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.cover} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-tr ${c.color} opacity-70`} />
                <span className="absolute top-4 left-4 badge bg-white/15 text-white ring-1 ring-white/30 backdrop-blur">{c.duration}</span>
              </div>
              <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-sm font-semibold text-brand-700">{c.tagline}</p>
                    <h2 className="mt-1.5">{c.title}</h2>
                  </div>
                  <div className="text-right">
                    {c.certificate && <span className="badge-brand">Certificate included</span>}
                  </div>
                </div>
                <p className="mt-3 text-ink-600 leading-relaxed">{c.shortDescription}</p>

                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div><p className="text-xs uppercase tracking-wider text-ink-500 font-semibold">Schedule</p><p className="mt-1 text-ink-800 font-medium">{c.timings}</p></div>
                  <div><p className="text-xs uppercase tracking-wider text-ink-500 font-semibold">Batch starts</p><p className="mt-1 text-ink-800 font-medium">{c.cohortStart ? formatDate(c.cohortStart) : '—'}</p></div>
                  <div><p className="text-xs uppercase tracking-wider text-ink-500 font-semibold">Seats</p><p className="mt-1 text-ink-800 font-medium">{c.seatsRemaining} / {c.totalSeats}</p></div>
                  <div><p className="text-xs uppercase tracking-wider text-ink-500 font-semibold">Best for</p><p className="mt-1 text-ink-800 font-medium line-clamp-1">{c.audience}</p></div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={`/courses/${c.slug}`} className="btn-secondary btn-md">Curriculum & details</Link>
                  <Link href={`/apply?course=${c.slug}`} className="btn-primary btn-md">Apply for this batch</Link>
                </div>
              </div>
            </Reveal>
          ))}
          {courses.length === 0 && (
            <div className="card card-pad text-center py-16">
              <p className="text-sm text-ink-500">No courses are currently published.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-ink-50">
        <div className="container-app grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <span className="eyebrow">FAQ</span>
            <h2 className="mt-3">Common questions about the programs.</h2>
            <p className="mt-3 text-ink-600">Everything you need to know before you apply. If we missed something, our team replies on WhatsApp within 24 hours.</p>
            <Link href="/contact" className="mt-6 btn-secondary btn-md">Ask us anything</Link>
          </div>
          <Accordion items={faqs.map(f => ({ q: f.q, a: f.a }))} />
        </div>
      </section>
    </>
  );
}
