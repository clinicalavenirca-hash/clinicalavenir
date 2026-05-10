import Link from 'next/link';
import { Reveal } from '@/components/ui/Reveal';
import { Accordion } from '@/components/ui/Disclosure';
import { faqs } from '@/lib/data';

export default function FAQPage() {
  return (
    <>
      <section className="hero-gradient">
        <div className="container-app py-12 sm:py-16">
          <div className="max-w-2xl">
            <Reveal><span className="eyebrow">FAQ</span></Reveal>
            <Reveal delay={0.04}><h1 className="mt-3">Frequently asked questions.</h1></Reveal>
            <Reveal delay={0.08}><p className="mt-3 text-ink-600 text-lg">Everything you need to know before you apply. Still have questions? <Link href="/contact" className="font-semibold text-brand-700">Talk to us</Link>.</p></Reveal>
          </div>
        </div>
      </section>
      <section className="py-12 sm:py-16">
        <div className="container-tight">
          <Accordion items={faqs.map(f => ({ q: f.q, a: f.a }))} />
        </div>
      </section>
    </>
  );
}
