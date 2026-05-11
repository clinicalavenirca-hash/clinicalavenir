import Link from 'next/link';
import { MapPin, Clock, ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { ContactForm } from '@/components/public/ContactForm';

export const dynamic = 'force-dynamic';

export default function ContactPage() {
  return (
    <>
      {/* HERO */}
      <section className="hero-gradient">
        <div className="container-app pt-12 pb-10 sm:pt-16 sm:pb-14">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <Reveal><span className="eyebrow">Contact</span></Reveal>
              <Reveal delay={0.04}>
                <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-ink-950 leading-[1.05] tracking-tight">
                  Talk to us{' '}
                  <span className="font-serif italic font-normal text-accent-500">before</span> you apply.
                </h1>
              </Reveal>
            </div>
            <div className="lg:col-span-4">
              <Reveal delay={0.08}>
                <p className="text-ink-600 text-base sm:text-lg leading-relaxed">
                  We reply within 24 hours — usually faster on WhatsApp. Ask anything about the program, payment, or your career path.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN — two columns: form left, channels + meta right */}
      <section className="py-14 sm:py-20 bg-cream-50">
        <div className="container-app grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Form — sits in a clean white card on the left */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-white ring-1 ring-ink-200 p-6 sm:p-8 shadow-soft">
              <p className="eyebrow-serif">— Send a message</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-display font-bold text-ink-950 leading-tight">
                Use the form, or pick a faster channel →
              </h2>
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>
          </div>

          {/* Right column — portrait image + office info */}
          <aside className="lg:col-span-5 space-y-4">
            {/* Person illustration — transparent PNG, sized down and sitting
                directly above the office card with no overlap */}
            <Reveal as="div">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/oneperson.png"
                alt=""
                className="w-[78%] sm:w-[72%] h-auto object-contain mx-auto block"
              />
            </Reveal>

            {/* Office hours + based-in strip */}
            <Reveal as="div" delay={0.05}>
              <div className="rounded-2xl bg-white p-6 ring-1 ring-ink-200">
                <p className="eyebrow-serif">— Office hours</p>
                <ul className="mt-4 space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <Clock className="w-4 h-4 mt-0.5 text-ink-500 flex-shrink-0" strokeWidth={1.8} />
                    <div>
                      <p className="font-semibold text-ink-950">Mon – Sat</p>
                      <p className="text-ink-500">9 AM – 7 PM EST</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-0.5 text-ink-500 flex-shrink-0" strokeWidth={1.8} />
                    <div>
                      <p className="font-semibold text-ink-950">Toronto, Canada</p>
                      <p className="text-ink-500">Remote-first across the GTA</p>
                    </div>
                  </li>
                </ul>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      {/* CTA strip */}
      <section className="py-12 sm:py-16 bg-ink-50 border-t border-ink-200">
        <div className="container-app flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="eyebrow-serif">— Ready when you are</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-display font-bold text-ink-950 leading-tight">
              Skip the form. Apply directly.
            </h2>
          </div>
          <Link href="/apply" className="inline-flex items-center gap-2 text-ink-950 font-semibold hover:gap-3 transition-all">
            <span className="border-b border-ink-900 pb-0.5">Open the application</span>
            <ArrowUpRight className="w-4 h-4" strokeWidth={2.2} />
          </Link>
        </div>
      </section>
    </>
  );
}
