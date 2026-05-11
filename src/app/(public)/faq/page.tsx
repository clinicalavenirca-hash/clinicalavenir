import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { Accordion } from '@/components/ui/Disclosure';
import { fetchFaqs } from '@/lib/db/faqs';

export const dynamic = 'force-dynamic';

const STATS = [
  { value: '8–10', label: 'weeks per program' },
  { value: '1:1', label: 'instructor reviews' },
  { value: '24h', label: 'reply turnaround' },
  { value: 'Live', label: 'every session' }
];

export default async function FAQPage() {
  const faqs = await fetchFaqs();
  return (
    <>
      {/* HERO */}
      <section className="hero-gradient">
        <div className="container-app pt-12 pb-10 sm:pt-16 sm:pb-14">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <Reveal>
                <span className="eyebrow">FAQ</span>
              </Reveal>
              <Reveal delay={0.04}>
                <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-ink-950 leading-[1.05] tracking-tight">
                  Everything you need to know{' '}
                  <span className="font-serif italic font-normal text-accent-500">before</span> you apply.
                </h1>
              </Reveal>
            </div>
            <div className="lg:col-span-4">
              <Reveal delay={0.08}>
                <p className="text-ink-600 text-base sm:text-lg leading-relaxed">
                  Still have questions?{' '}
                  <Link href="/contact" className="font-semibold text-ink-950 underline underline-offset-4 hover:text-accent-600 transition-colors">
                    Talk to us
                  </Link>{' '}— we reply within 24 hours.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP — editorial 4-up under the hero */}
      <section className="border-y border-ink-200 bg-white">
        <div className="container-app py-8 sm:py-10">
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-6 sm:gap-x-8 lg:divide-x lg:divide-ink-200">
            {STATS.map((s, i) => (
              <li key={s.label} className={`lg:pl-8 ${i === 0 ? 'lg:pl-0' : ''}`}>
                <p className="font-display font-bold text-ink-950 text-2xl sm:text-3xl lg:text-4xl tracking-tight tabular-nums">
                  {s.value}
                </p>
                <p className="mt-1 text-[10px] sm:text-xs uppercase tracking-[0.18em] font-semibold text-ink-500">
                  {s.label}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* MAIN — sticky topic rail + accordion */}
      <section className="py-14 sm:py-20 bg-cream-50">
        <div className="container-app grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Sidebar — sticky on lg+ */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <p className="eyebrow-serif">— Frequently asked</p>
              <h2 className="mt-3 text-2xl sm:text-3xl font-display font-bold text-ink-950 leading-[1.15]">
                Questions we hear most.
              </h2>
              <p className="mt-4 text-ink-600 text-sm leading-relaxed">
                If your question isn&apos;t answered here, reach out — we&apos;d rather over-explain than have you guessing.
              </p>
              <Link
                href="/contact"
                className="mt-6 inline-flex items-center gap-2 text-ink-950 font-medium hover:gap-3 transition-all"
              >
                <span className="border-b border-ink-900 pb-0.5">Ask us anything</span>
                <ArrowUpRight className="w-4 h-4" strokeWidth={2.2} />
              </Link>

              {/* Mini contact card */}
              <div className="mt-10 p-5 rounded-2xl bg-ink-950 text-white">
                <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-accent-400">
                  Prefer WhatsApp?
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-200">
                  Tap the WhatsApp icon on the contact page — most days we reply within an hour, same-day always.
                </p>
                <Link href="/contact" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white hover:gap-2.5 transition-all">
                  Open chat <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.2} />
                </Link>
              </div>
            </div>
          </aside>

          {/* Accordion */}
          <div className="lg:col-span-8">
            <Accordion items={faqs.map((f) => ({ q: f.question, a: f.answer }))} />
          </div>
        </div>
      </section>
    </>
  );
}
