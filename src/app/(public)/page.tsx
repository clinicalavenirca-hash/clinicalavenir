import Link from 'next/link';
import {
  ArrowUpRight, Stethoscope, ClipboardCheck, FlaskConical, Database,
  Briefcase, FileText, GraduationCap, Kanban, Award, MessageCircle, Quote,
  type LucideIcon
} from 'lucide-react';
import { fetchCourses } from '@/lib/db/courses';
import { fetchInstructor } from '@/lib/db/instructor';
import { fetchStories } from '@/lib/db/stories';
import { Reveal } from '@/components/ui/Reveal';
import { spellCount } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { CoursesRealtime } from '@/components/realtime/CoursesRealtime';
import { StoriesRealtime } from '@/components/realtime/StoriesRealtime';
import { InstructorSection } from '@/components/public/InstructorSection';
import { Hero } from '@/components/hero/Hero';
import { TrustMarquee } from '@/components/public/TrustMarquee';
import { ProgramCard } from '@/components/public/ProgramCard';
import { RevealHeading } from '@/components/ui/RevealHeading';
import { PointerHighlight } from '@/components/ui/PointerHighlight';
import { ShinyButton } from '@/components/ui/ShinyButton';

export const dynamic = 'force-dynamic';

// Map course slugs to the right medical/professional icon.
const ICONS_BY_SLUG: Record<string, LucideIcon> = {
  'pharmacovigilance': Stethoscope,
  'regulatory-affairs': ClipboardCheck,
  'clinical-research': FlaskConical,
  'clinical-data-management': Database
};
const FALLBACK_ICON: LucideIcon = FlaskConical;

export default async function HomePage() {
  const [courses, instructor, stories] = await Promise.all([
    fetchCourses(),
    fetchInstructor(),
    fetchStories()
  ]);

  return (
    <>
      <CoursesRealtime />
      <StoriesRealtime />

      {/* HERO — GSAP typographic stack with soonest course as meta source */}
      <Hero stories={stories} nextCourse={courses[0] ?? null} />

      {/* TRUST STRIP — animated marquee */}
      <TrustMarquee />

      {/* PROGRAMS — editorial tilt cards */}
      <section className="py-20 sm:py-28 bg-ink-50">
        <div className="container-app">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mb-12 sm:mb-16 items-end">
            <div className="lg:col-span-7">
              <p className="eyebrow">{spellCount(courses.length)} {courses.length === 1 ? 'track' : 'tracks'}</p>
              <RevealHeading
                as="h2"
                text="Pick a discipline. We do the rest."
                accent="discipline"
                className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-ink-950 leading-[1.05]"
              />
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <p className="text-ink-600 text-base sm:text-lg leading-relaxed">
                Each program is eight weeks of live instruction, hands-on labs, and 1:1 reviews. Pick one — or stack multiple at a discount.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
            {courses.map((c, i) => (
              <Reveal key={c.id} delay={i * 0.06}>
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
            {courses.length === 0 && (
              <p className="md:col-span-2 text-sm text-ink-500 text-center py-16">
                No programs published yet.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* WHY — editorial 3-column with serif accents */}
      <section className="py-20 sm:py-28 bg-cream-50 noise-bg">
        <div className="container-app">
          <div className="max-w-3xl mb-14 sm:mb-20">
            <p className="eyebrow-serif">— Why Avenir</p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-ink-950 leading-[1.15]">
              Built for the gap between graduation and your{' '}
              <PointerHighlight>first regulated role</PointerHighlight>.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
            {[
              { Icon: Briefcase,    title: 'A job board tagged to your track', desc: 'Only roles relevant to courses you own — no PV listings in your CDM feed.' },
              { Icon: FileText,     title: 'Resume that recruiters open', desc: 'ATS-friendly templates designed for RA, PV, CR, and CDM. Live preview.' },
              { Icon: GraduationCap,title: 'Interview prep that mirrors real screens', desc: 'Curated banks for ICH-GCP, Health Canada, FDA, EMA — with sample answers.' },
              { Icon: Kanban,       title: 'A Kanban tracker for every application', desc: 'Move cards Applied → Interview → Offer → Rejected. Stay organized.' },
              { Icon: Award,        title: 'Certified completion', desc: 'Verifiable certificate on completion. Upload it directly to LinkedIn.' },
              { Icon: MessageCircle,title: 'WhatsApp office hours', desc: 'Ask the team anything before, during, and after the program. Real reply within hours.' }
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.04}>
                <div className="group">
                  <span className="inline-flex w-11 h-11 rounded-xl bg-ink-950 text-white items-center justify-center">
                    <f.Icon className="w-5 h-5" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-5 text-lg font-display font-semibold text-ink-950 leading-snug">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-ink-600 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* INSTRUCTOR */}
      {instructor && <InstructorSection instructor={instructor} />}

      {/* TESTIMONIALS — editorial pull-quote grid */}
      <section className="py-20 sm:py-28">
        <div className="container-app">
          <div className="max-w-2xl mb-14">
            <p className="eyebrow-serif">— Stories</p>
            <RevealHeading
              as="h2"
              text="From classroom to first day on the job."
              accent="first day"
              className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-ink-950 leading-[1.1]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {stories.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.05} as="article" className="card card-pad card-hover relative h-full">
                <Quote className="absolute top-5 right-5 w-7 h-7 text-brand-100" fill="currentColor" strokeWidth={0} />
                <blockquote className="text-ink-800 leading-relaxed pr-8 font-serif text-lg italic">
                  &ldquo;{s.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 pt-5 border-t border-ink-100">
                  <Avatar name={s.name} src={s.avatar} size="md" />
                  <div>
                    <p className="font-semibold text-ink-950 text-sm">{s.name}</p>
                    <p className="text-xs text-ink-500">{s.placement}</p>
                  </div>
                </figcaption>
              </Reveal>
            ))}
            {stories.length === 0 && (
              <p className="col-span-full text-center text-sm text-ink-500 py-8">
                No stories yet — they&apos;ll appear here as graduates share theirs.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CTA — dark editorial slab with grid backdrop */}
      <section className="py-12 sm:py-20">
        <div className="container-app">
          <div className="relative overflow-hidden rounded-3xl bg-ink-950 text-white p-8 sm:p-14 lg:p-20">
            {/* Grid lines */}
            <div className="absolute inset-0 grid-lines opacity-40" aria-hidden />
            {/* Indigo wash */}
            <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-brand-600/30 blur-3xl" aria-hidden />
            <div className="absolute -bottom-32 -left-32 w-[24rem] h-[24rem] rounded-full bg-accent-500/20 blur-3xl" aria-hidden />

            <div className="relative grid lg:grid-cols-12 gap-10 items-end">
              <div className="lg:col-span-8">
                <p className="eyebrow-serif">— Ready when you are</p>
                <h2 className="mt-3 font-display font-bold text-white text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
                  Apply in two minutes.
                  <br />
                  We reply within twenty-four hours.
                </h2>
                <p className="mt-6 text-ink-300 text-lg max-w-2xl">
                  No payment on this site. Our admissions team handles billing off-platform once your application is reviewed.
                </p>
              </div>
              <div className="lg:col-span-4 lg:flex lg:justify-end flex flex-wrap gap-4">
                <ShinyButton href="/apply" size="lg">Apply now</ShinyButton>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium"
                >
                  <span className="border-b border-white/40 hover:border-white pb-0.5">Talk to us</span>
                  <ArrowUpRight className="w-4 h-4" strokeWidth={2.2} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
