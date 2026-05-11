import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check, MessageCircle } from 'lucide-react';
import { faqs } from '@/lib/data';
import { fetchCourseBySlug } from '@/lib/db/courses';
import { fetchCourseCurriculum } from '@/lib/db/modules';
import { Reveal } from '@/components/ui/Reveal';
import { Accordion } from '@/components/ui/Disclosure';
import { CoursesRealtime } from '@/components/realtime/CoursesRealtime';
import { ModuleAccordion } from '@/components/public/ModuleAccordion';
import { formatDate, isCourseRegistrationClosed } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const course = await fetchCourseBySlug(params.slug);
  if (!course) notFound();
  const modules = await fetchCourseCurriculum(course.slug);
  const fillBase = course.totalSeats > 0 ? ((course.totalSeats - course.seatsRemaining) / course.totalSeats) * 100 : 0;
  const fill = Math.max(0, Math.min(100, Math.round(fillBase)));
  const closed = isCourseRegistrationClosed(course);
  const seatsFull = course.seatsRemaining <= 0;
  const canApply = !closed && !seatsFull;

  return (
    <>
      <CoursesRealtime />
      <section className="relative bg-ink-950 text-white overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={course.cover} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        {/* Soft ink wash so text stays legible — no heavy color overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/40" />
        <div className="relative container-app py-16 sm:py-20 lg:py-24">
          <Link href="/courses" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" /> All courses
          </Link>
          <div className="mt-5 grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <Reveal><span className="badge bg-white/15 text-white ring-1 ring-white/30 backdrop-blur">{course.tagline}</span></Reveal>
              <Reveal delay={0.04}><h1 className="mt-4 text-white">{course.title}</h1></Reveal>
              <Reveal delay={0.08}><p className="mt-4 text-lg text-white/90 max-w-2xl leading-relaxed">{course.shortDescription}</p></Reveal>
            </div>
            <Reveal delay={0.1} className="lg:col-span-4 glass rounded-2xl p-5 text-ink-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-ink-500">Batch starts</p>
                  <p className="font-display text-xl font-bold mt-0.5 text-ink-950">{course.cohortStart ? formatDate(course.cohortStart, { month: 'long', day: 'numeric' }) : 'TBD'}</p>
                </div>
                <span className="badge-accent text-xs">{course.seatsRemaining} / {course.totalSeats} seats</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-accent-400 to-accent-600" style={{ width: `${fill}%` }} />
              </div>
              {canApply ? (
                <Link href={`/apply?course=${course.slug}`} className="mt-4 btn-primary btn-md w-full justify-center">Apply for this batch</Link>
              ) : (
                <div className="mt-4 px-4 py-2.5 rounded-xl bg-ink-100 text-ink-600 text-center text-sm font-medium">
                  {closed ? 'Registration closed for this batch' : 'No seats remaining'}
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-b border-ink-100 bg-white">
        <div className="container-app py-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><p className="text-xs uppercase tracking-wider text-ink-500 font-semibold">Duration</p><p className="mt-1 font-medium text-ink-900">{course.duration}</p></div>
          <div><p className="text-xs uppercase tracking-wider text-ink-500 font-semibold">Schedule</p><p className="mt-1 font-medium text-ink-900">{course.timings}</p></div>
          <div><p className="text-xs uppercase tracking-wider text-ink-500 font-semibold">Certificate</p><p className="mt-1 font-medium text-ink-900">{course.certificate ? 'Included' : 'Not included'}</p></div>
          <div><p className="text-xs uppercase tracking-wider text-ink-500 font-semibold">Apply by</p><p className="mt-1 font-medium text-ink-900">{course.registrationEnd ? formatDate(course.registrationEnd, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Open'}</p></div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container-app grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-12">
            <Reveal>
              <h2>What you&apos;ll learn</h2>
              <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                {course.whatYouWillLearn.map(item => (
                  <li key={item} className="flex gap-3 p-4 rounded-xl bg-ink-50 border border-ink-100">
                    <span className="mt-0.5 w-6 h-6 flex-shrink-0 rounded-full bg-emerald-600 text-white grid place-items-center"><Check className="w-3.5 h-3.5" strokeWidth={3} /></span>
                    <span className="text-ink-800 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal>
              <h2>Curriculum</h2>
              <p className="mt-2 text-ink-600">Weekly modules with live sessions, recordings, hands-on labs, and 1:1 reviews.</p>
              <ModuleAccordion modules={modules} />
            </Reveal>

            <Reveal>
              <h2>Who this is for</h2>
              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <div className="card card-pad">
                  <p className="eyebrow">Best for</p>
                  <p className="mt-2 text-ink-800 leading-relaxed">{course.bestFor}</p>
                </div>
                <div className="card card-pad">
                  <p className="eyebrow">You&apos;ll be ready to be</p>
                  <p className="mt-2 text-ink-800 leading-relaxed">{course.audience}</p>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <h2>Frequently asked</h2>
              <div className="mt-6">
                <Accordion items={faqs.slice(0, 4).map(f => ({ q: f.q, a: f.a }))} />
              </div>
            </Reveal>
          </div>

          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-5">
              <div className="card card-pad">
                <p className="eyebrow">Enrol</p>
                <h3 className="mt-2 font-display text-2xl font-bold text-ink-900 leading-tight">{course.title}</h3>
                {course.certificate && <p className="mt-1 text-sm text-ink-500">Includes verifiable certificate</p>}
                <ul className="mt-5 space-y-3 text-sm">
                  {[
                    `${course.duration} live batch`,
                    'All sessions recorded within 24 hrs',
                    'Job board tagged to this track',
                    'Resume builder + interview prep'
                  ].map(b => (
                    <li key={b} className="flex gap-3">
                      <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" strokeWidth={2.5} />
                      <span className="text-ink-700">{b}</span>
                    </li>
                  ))}
                </ul>
                {canApply ? (
                  <>
                    <Link href={`/apply?course=${course.slug}`} className="mt-6 btn-primary btn-lg w-full justify-center">Apply now</Link>
                    <p className="mt-3 text-xs text-center text-ink-500">No payment on this site. We&apos;ll reach out within 24 hours.</p>
                  </>
                ) : (
                  <div className="mt-6 p-4 rounded-xl bg-ink-50 border border-ink-100 text-center">
                    <p className="text-sm font-semibold text-ink-900">{closed ? 'Registration closed' : 'Batch full'}</p>
                    <p className="text-xs text-ink-600 mt-1">
                      {closed
                        ? 'Applications for this batch are no longer accepted. Browse other programs to find one that fits your timeline.'
                        : 'Every seat in this batch is taken. Check back when the next batch opens.'}
                    </p>
                    <Link href="/courses" className="mt-3 btn-secondary btn-sm w-full justify-center">View open programs</Link>
                  </div>
                )}
              </div>

              <div className="card card-pad">
                <p className="eyebrow">Need help deciding?</p>
                <p className="mt-2 text-sm text-ink-700">Chat with our team on WhatsApp. We typically reply within an hour.</p>
                <Link href="/contact" className="mt-4 btn-secondary btn-md w-full justify-center">
                  <MessageCircle className="w-4 h-4" /> Talk to us
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
