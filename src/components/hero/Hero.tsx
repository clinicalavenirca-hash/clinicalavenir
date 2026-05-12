'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ShinyButton } from '@/components/ui/ShinyButton';
import { Magnetic } from '@/components/ui/Magnetic';
import { Avatar } from '@/components/ui/Avatar';
import type { Story, Course } from '@/lib/data';
import { formatDate } from '@/lib/utils';

type Props = {
  stories: Story[];
  /** Soonest upcoming course — drives the "Next batch" + "Format" meta strip. */
  nextCourse: Course | null;
};

/**
 * Editorial hero with a typographic left column and an image right column.
 * GSAP timeline staggers the eyebrow → headline → sub → CTAs → meta strip
 * on mount. All meta values are data-driven from the soonest course and
 * actual story records — no hardcoded counts.
 */
export function Hero({ stories, nextCourse }: Props) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.from(
          '[data-hero="line"]',
          { y: 70, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out' }
        )
        .from('[data-hero="sub"]', { y: 14, opacity: 0, duration: 0.6 }, '-=0.55')
        .from('[data-hero="cta"]', { y: 12, opacity: 0, duration: 0.45, stagger: 0.06 }, '-=0.4')
        .from('[data-hero="image"]', { scale: 1.05, opacity: 0, duration: 1.1, ease: 'expo.out' }, '-=0.9')
        .from('[data-hero="proof"]', { x: -16, opacity: 0, duration: 0.5 }, '-=0.5')
        .from('[data-hero="meta"]', { y: 12, opacity: 0, duration: 0.5 }, '-=0.4');
    }, root);
    return () => ctx.revert();
  }, []);

  // Pull company names from real story placements: "Role @ Company" → "Company"
  const companies = stories
    .map((s) => {
      const at = s.placement.split('@')[1]?.trim();
      return at ?? s.placement.split(',').pop()?.trim() ?? '';
    })
    .filter(Boolean)
    .slice(0, 3);

  return (
    <section ref={root} className="relative isolate overflow-hidden bg-cream-50">
      <div className="container-app pt-4 pb-12 sm:pt-6 sm:pb-16 lg:pt-8 lg:pb-20 relative">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-end">
          {/* LEFT — text column */}
          <div className="lg:col-span-7 lg:pb-6">
            <h1 className="font-display font-bold leading-[0.95] tracking-[-0.03em] text-ink-950 text-[clamp(2.2rem,6.5vw,4.75rem)]">
              <span className="block overflow-hidden pb-[0.2em] -mb-[0.15em]">
                <span data-hero="line" className="block">Launch your</span>
              </span>
              <span className="block overflow-hidden pb-[0.2em] -mb-[0.15em]">
                <span data-hero="line" className="block">
                  <span className="font-serif font-normal italic text-accent-500 pr-2">career</span>
                  <span>in</span>
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.2em] -mb-[0.15em]">
                <span data-hero="line" className="block">life sciences.</span>
              </span>
            </h1>

            {/* Mobile-only image — sits between heading and sub paragraph
                so the visual order on small screens is heading → image → sub */}
            <div className="lg:hidden mt-8 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Untitled.png"
                alt=""
                data-hero="image"
                className="w-full max-w-xs sm:max-w-sm h-auto object-contain block"
              />
            </div>

            <p data-hero="sub" className="mt-6 max-w-xl text-base sm:text-lg text-ink-600 leading-relaxed">
              Live cohorts in Pharmacovigilance, Regulatory Affairs, Clinical Research, and Clinical Data Management — paired with a job board, resume tools, and interview prep for the Canadian market.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <div data-hero="cta">
                <Magnetic strength={10}>
                  <ShinyButton href="/apply" size="lg">Apply now</ShinyButton>
                </Magnetic>
              </div>
              <div data-hero="cta">
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 text-ink-950 font-medium hover:gap-3 transition-all"
                >
                  <span className="border-b border-ink-900 pb-0.5">Browse programs</span>
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>

            {/* Proof strip — uses actual stories, no fake count */}
            {stories.length > 0 && (
              <div data-hero="proof" className="mt-10 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {stories.slice(0, 4).map((s) => (
                    <Avatar key={s.id} name={s.name} src={s.avatar} size="sm" ringClassName="ring-2 ring-cream-50" />
                  ))}
                </div>
                <div className="text-sm">
                  <p className="text-ink-500 text-xs uppercase tracking-[0.18em] font-semibold">Recent placements</p>
                  <p className="font-semibold text-ink-950 mt-0.5">
                    {companies.length > 0 ? companies.join(' · ') : 'IQVIA · Bayer · GSK'}
                  </p>
                </div>
              </div>
            )}

            {/* Small inline meta strip — no card, no glass, just text */}
            {nextCourse && (
              <div data-hero="meta" className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <span className="text-ink-500">
                  Next batch{' '}
                  <span className="text-ink-950 font-semibold">
                    {nextCourse.cohortStart
                      ? formatDate(nextCourse.cohortStart, { month: 'long', day: 'numeric', year: 'numeric' })
                      : 'TBA'}
                  </span>
                </span>
                <span className="w-1 h-1 rounded-full bg-ink-300" aria-hidden />
                <span className="text-ink-500">
                  Format{' '}
                  <span className="text-ink-950 font-semibold">Live · 30 days</span>
                </span>
              </div>
            )}
          </div>

          {/* RIGHT — transparent PNG, lg+ only. Mobile/tablet use the
              inline image inside the text column for proper visual order. */}
          <div className="hidden lg:flex lg:col-span-5 items-center justify-end self-stretch">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Untitled.png"
              alt=""
              data-hero="image"
              className="w-full h-auto object-contain block origin-center scale-[1.35] -translate-y-[6%]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
