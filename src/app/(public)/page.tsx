import Link from 'next/link';
import { ArrowRight, Calendar, ShieldCheck, Briefcase, FileText, GraduationCap, Kanban, Award, MessageCircle, Quote } from 'lucide-react';
import { fetchCourses } from '@/lib/db/courses';
import { fetchInstructor } from '@/lib/db/instructor';
import { fetchStories } from '@/lib/db/stories';
import { Reveal } from '@/components/ui/Reveal';
import { Avatar } from '@/components/ui/Avatar';
import { CoursesRealtime } from '@/components/realtime/CoursesRealtime';
import { StoriesRealtime } from '@/components/realtime/StoriesRealtime';
import { InstructorSection } from '@/components/public/InstructorSection';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

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
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="container-app py-16 sm:py-20 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7">
              <Reveal><span className="eyebrow">For pharmacy & life-sciences graduates</span></Reveal>
              <Reveal delay={0.04}><h1 className="mt-4">Land your first regulated role in <span className="text-brand-700">Canada</span> — with the program that actually trains you to do the job.</h1></Reveal>
              <Reveal delay={0.08}><p className="mt-5 text-lg text-ink-600 max-w-2xl leading-relaxed">Pharmacovigilance, Regulatory Affairs, Clinical Research, Clinical Data Management — taught live by industry leads, paired with a job board, resume tools, and interview prep that grow with you.</p></Reveal>
              <Reveal delay={0.12}>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/apply" className="btn-primary btn-lg">
                    <span>Enrol now</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="/courses" className="btn-secondary btn-lg">Browse courses</Link>
                </div>
              </Reveal>
              <Reveal delay={0.16}>
                <div className="mt-10 flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {stories.slice(0, 3).map(s => (
                      <Avatar key={s.id} name={s.name} src={s.avatar} size="md" ringClassName="ring-2 ring-white" />
                    ))}
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-ink-900">300+ graduates placed</p>
                    <p className="text-ink-500">across IQVIA, Bayer, GSK, Veristat, and more</p>
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.1} className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-soft-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=900&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/70 via-brand-700/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 glass rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Next cohort</p>
                      <p className="font-display text-lg font-bold text-ink-900 mt-0.5">June 10, 2026</p>
                    </div>
                    <span className="badge-accent text-xs">8 seats left</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 bg-white rounded-2xl shadow-soft-lg p-4 max-w-[220px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 grid place-items-center text-emerald-700">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">Job-ready certificate</p>
                    <p className="text-xs text-ink-500">on completion</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-2 sm:-bottom-6 sm:-right-6 bg-white rounded-2xl shadow-soft-lg p-4 max-w-[240px]">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Live + recorded</p>
                <p className="text-sm text-ink-900 mt-1 leading-snug">Every session is recorded and added to your dashboard within 24 hrs.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-ink-100 bg-white">
        <div className="container-app py-8">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-ink-500">Graduates working at</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-ink-400 font-display font-bold text-lg sm:text-xl">
            <span>IQVIA</span><span>•</span><span>Bayer</span><span>•</span><span>GSK</span><span>•</span><span>Veristat</span><span>•</span><span>Syneos</span><span>•</span><span>PPD</span>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-16 sm:py-20">
        <div className="container-app">
          <div className="max-w-2xl">
            <Reveal><span className="eyebrow">Programs</span></Reveal>
            <Reveal delay={0.04}><h2 className="mt-3">Four career tracks. One platform.</h2></Reveal>
            <Reveal delay={0.08}><p className="mt-3 text-ink-600 text-lg">Each program is 8–10 weeks of live cohort learning, hands-on labs, and 1:1 instructor reviews. Pick one — or combine.</p></Reveal>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
            {courses.map((c, i) => (
              <Reveal key={c.id} delay={i * 0.05}>
                <Link href={`/courses/${c.slug}`} className="group card card-hover overflow-hidden flex flex-col h-full">
                  <div className="relative aspect-[16/8] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.cover} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${c.color} opacity-80`} />
                    <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-white/80">{c.tagline}</p>
                        <h3 className="text-white text-2xl font-display font-bold mt-1 leading-tight">{c.title}</h3>
                      </div>
                      <span className="badge bg-white/15 text-white ring-1 ring-white/30 backdrop-blur">{c.duration}</span>
                    </div>
                  </div>
                  <div className="p-5 sm:p-6 flex-1 flex flex-col">
                    <p className="text-ink-600 text-sm leading-relaxed line-clamp-2">{c.shortDescription}</p>
                    <div className="mt-5 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3 text-ink-500">
                        <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formatDate(c.cohortStart)}</span>
                        <span className="inline-flex items-center gap-1.5 text-accent-600 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />{c.seatsRemaining} seats left
                        </span>
                      </div>
                      <span className="font-semibold text-brand-700 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        View <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming batches */}
      <section className="py-16 sm:py-20 bg-ink-50">
        <div className="container-app">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div className="max-w-xl">
              <Reveal><span className="eyebrow">Upcoming batches</span></Reveal>
              <Reveal delay={0.04}><h2 className="mt-3">Lock your seat for the next cohort.</h2></Reveal>
              <Reveal delay={0.08}><p className="mt-3 text-ink-600">Seats fill on a first-come basis. Apply early to secure 1:1 onboarding with the instructor.</p></Reveal>
            </div>
            <Link href="/courses" className="hidden sm:inline-flex btn-secondary btn-md">All cohorts</Link>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {courses.map((c, i) => {
              const fill = Math.round(((c.totalSeats - c.seatsRemaining) / c.totalSeats) * 100);
              return (
                <Reveal key={c.id} delay={i * 0.04}>
                  <div className="card card-pad card-hover">
                    <div className="flex items-center justify-between">
                      <span className="badge-brand">{c.duration}</span>
                      <span className={`text-xs font-semibold ${c.seatsRemaining <= 5 ? 'text-rose-600' : 'text-accent-600'}`}>
                        {c.seatsRemaining} / {c.totalSeats} seats
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-display font-bold leading-tight">{c.title}</h3>
                    <p className="mt-1 text-sm text-ink-600">{c.timings}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-ink-400" />
                      <span className="text-ink-700">Starts {formatDate(c.cohortStart, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="mt-4">
                      <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-brand-500 to-brand-700" style={{ width: `${fill}%` }} />
                      </div>
                    </div>
                    <Link href={`/apply?course=${c.slug}`} className="mt-5 btn-primary btn-md w-full justify-center">Apply for this cohort</Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="py-16 sm:py-20">
        <div className="container-app">
          <div className="max-w-2xl mx-auto text-center">
            <Reveal><span className="eyebrow">Why Avenir</span></Reveal>
            <Reveal delay={0.04}><h2 className="mt-3">Built for the gap between graduation and your first regulated role.</h2></Reveal>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { Icon: Briefcase,    title: 'A job board tagged to your track', desc: 'Only roles relevant to courses you own — no Clinical Research listings clogging up a PV student feed.' },
              { Icon: FileText,     title: 'Resume that recruiters open',      desc: 'ATS-friendly templates designed for RA, PV, CR, and CDM with a live preview as you type.' },
              { Icon: GraduationCap,title: 'Interview prep that mirrors real screens', desc: 'Curated banks for ICH-GCP, Health Canada, FDA, and EMA with sample answers from working professionals.' },
              { Icon: Kanban,       title: 'A Kanban tracker for every application', desc: 'Move cards through Applied → Interview → Offer → Rejected. Stay organized when ten leads are in the air.' },
              { Icon: Award,        title: 'Certified completion',             desc: 'Earn a verifiable certificate on completion — recognized when you upload it to LinkedIn.' },
              { Icon: MessageCircle,title: 'Direct WhatsApp support',          desc: 'Most students prefer WhatsApp — ask the team anything before, during, and after the program.' }
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.04}>
                <div className="card card-pad card-hover h-full">
                  <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 grid place-items-center">
                    <f.Icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-display font-semibold">{f.title}</h3>
                  <p className="mt-2 text-ink-600 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Meet your instructor — only render if admin has populated the row */}
      {instructor && <InstructorSection instructor={instructor} />}

      {/* Testimonials */}
      <section className="py-16 sm:py-20">
        <div className="container-app">
          <div className="max-w-2xl">
            <Reveal><span className="eyebrow">Stories</span></Reveal>
            <Reveal delay={0.04}><h2 className="mt-3">From classroom to first day on the job.</h2></Reveal>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            {stories.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.05} as="article" className="card card-pad card-hover relative h-full">
                <Quote className="absolute top-5 right-5 w-7 h-7 text-brand-100" fill="currentColor" />
                <blockquote className="text-ink-800 leading-relaxed pr-8">&ldquo;{s.quote}&rdquo;</blockquote>
                <figcaption className="mt-5 flex items-center gap-3 pt-5 border-t border-ink-100">
                  <Avatar name={s.name} src={s.avatar} size="md" />
                  <div>
                    <p className="font-semibold text-ink-900 text-sm">{s.name}</p>
                    <p className="text-xs text-ink-500">{s.placement}</p>
                  </div>
                </figcaption>
              </Reveal>
            ))}
            {stories.length === 0 && (
              <p className="col-span-full text-center text-sm text-ink-500 py-8">No stories yet — admin can add them from the dashboard.</p>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16 sm:pb-20">
        <div className="container-app">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-6 sm:px-12 py-12 sm:py-16">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-accent-500 blur-3xl" />
            </div>
            <div className="relative grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <Reveal><h2 className="text-white">Ready to take the next step?</h2></Reveal>
                <Reveal delay={0.04}><p className="mt-3 text-brand-50 text-lg max-w-lg">Apply in 2 minutes. We get back within 24 hours with next steps and payment options.</p></Reveal>
              </div>
              <Reveal delay={0.08} className="flex flex-wrap gap-3 lg:justify-end">
                <Link href="/apply" className="btn-accent btn-lg">Enrol now</Link>
                <Link href="/contact" className="btn-secondary btn-lg !bg-white/10 !text-white !border-white/30 hover:!bg-white/20">Talk to us</Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
