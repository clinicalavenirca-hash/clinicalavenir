import Link from 'next/link';
import {
  Stethoscope, ClipboardCheck, FlaskConical, Database,
  type LucideIcon
} from 'lucide-react';
import { faqs } from '@/lib/data';
import { fetchCourses } from '@/lib/db/courses';
import { Reveal } from '@/components/ui/Reveal';
import { Accordion } from '@/components/ui/Disclosure';
import { CoursesRealtime } from '@/components/realtime/CoursesRealtime';
import { ProgramCard } from '@/components/public/ProgramCard';
import { spellCount, formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const ICONS_BY_SLUG: Record<string, LucideIcon> = {
  'pharmacovigilance': Stethoscope,
  'regulatory-affairs': ClipboardCheck,
  'clinical-research': FlaskConical,
  'clinical-data-management': Database
};
const FALLBACK_ICON: LucideIcon = FlaskConical;

export default async function CoursesPage() {
  const courses = await fetchCourses();
  return (
    <>
      <CoursesRealtime />

      {/* HERO — tight editorial intro */}
      <section className="hero-gradient">
        <div className="container-app pt-12 pb-10 sm:pt-16 sm:pb-14">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <span className="eyebrow">{spellCount(courses.length)} programs</span>
              <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-ink-950 leading-[1.05] tracking-tight">
                Career programs in <span className="font-serif italic font-normal text-accent-500">pharma</span> & life sciences.
              </h1>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <p className="text-ink-600 text-base sm:text-lg leading-relaxed">
                Eight to ten weeks of live instruction, hands-on labs, and a job board curated to your track. Pick the program that matches where you want to land.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CARDS — magazine-style image cards */}
      <section className="py-14 sm:py-20 bg-ink-50">
        <div className="container-app">
          {courses.length === 0 ? (
            <div className="card card-pad text-center py-16">
              <p className="text-sm text-ink-500">No programs are currently published.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
              {courses.map((c, i) => (
                <Reveal key={c.id} delay={i * 0.05}>
                  <ProgramCard
                    index={i + 1}
                    href={`/courses/${c.slug}`}
                    cover={c.cover}
                    tagline={c.tagline}
                    title={c.title}
                    blurb={c.shortDescription}
                    duration={c.duration}
                    seatsLine={`${c.seatsRemaining} seats left`}
                    Icon={ICONS_BY_SLUG[c.slug] ?? FALLBACK_ICON}
                  />
                </Reveal>
              ))}
            </div>
          )}

          {/* Meta table below the cards — schedule, batch start, audience */}
          {courses.length > 0 && (
            <div className="mt-16 sm:mt-20 rounded-3xl bg-white ring-1 ring-ink-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-brand-50 text-ink-700">
                    <th className="text-left text-[10px] font-semibold uppercase tracking-[0.18em] px-5 py-4">Program</th>
                    <th className="text-left text-[10px] font-semibold uppercase tracking-[0.18em] px-5 py-4 hidden sm:table-cell">Schedule</th>
                    <th className="text-left text-[10px] font-semibold uppercase tracking-[0.18em] px-5 py-4 hidden md:table-cell">Batch starts</th>
                    <th className="text-right text-[10px] font-semibold uppercase tracking-[0.18em] px-5 py-4">Seats</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c.id} className="border-t border-ink-100 hover:bg-brand-50/40 transition-colors">
                      <td className="px-5 py-4">
                        <Link href={`/courses/${c.slug}`} className="font-semibold text-ink-950 hover:text-accent-600 transition-colors">
                          {c.title}
                        </Link>
                        <p className="text-xs text-ink-500 mt-0.5">{c.tagline}</p>
                      </td>
                      <td className="px-5 py-4 text-ink-700 hidden sm:table-cell">{c.timings}</td>
                      <td className="px-5 py-4 text-ink-700 hidden md:table-cell">
                        {c.cohortStart ? formatDate(c.cohortStart, { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-display font-bold text-ink-950 tabular-nums">{c.seatsRemaining}</span>
                        <span className="text-ink-500"> / {c.totalSeats}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 bg-cream-50">
        <div className="container-app grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <p className="eyebrow-serif">— FAQ</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-display font-bold text-ink-950 leading-[1.1]">
              Common questions about the programs.
            </h2>
            <p className="mt-4 text-ink-600">
              Everything you need to know before you apply. If we missed something, our team replies on WhatsApp within 24 hours.
            </p>
            <Link href="/contact" className="mt-6 inline-flex items-center gap-2 text-ink-950 font-medium hover:gap-3 transition-all">
              <span className="border-b border-ink-900 pb-0.5">Ask us anything</span>
              <span aria-hidden>→</span>
            </Link>
          </div>
          <Accordion items={faqs.map((f) => ({ q: f.q, a: f.a }))} />
        </div>
      </section>
    </>
  );
}
