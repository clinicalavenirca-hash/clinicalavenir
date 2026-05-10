import { Reveal } from '@/components/ui/Reveal';
import { ContactForm } from '@/components/public/ContactForm';
import { Mail, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <>
      <section className="hero-gradient">
        <div className="container-app py-12 sm:py-16">
          <div className="max-w-2xl">
            <Reveal><span className="eyebrow">Contact</span></Reveal>
            <Reveal delay={0.04}><h1 className="mt-3">Talk to us before you apply.</h1></Reveal>
            <Reveal delay={0.08}><p className="mt-3 text-ink-600 text-lg">We reply within 24 hours — usually faster on WhatsApp. Ask anything about the program, payment, or your career path.</p></Reveal>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container-app grid lg:grid-cols-12 gap-8">
          <ContactForm />
          <aside className="lg:col-span-5 space-y-4">
            <Reveal as="div">
              <a href="https://wa.me/14165550000" target="_blank" rel="noopener" className="card card-pad card-hover flex items-start gap-4">
                <span className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900">WhatsApp us</p>
                  <p className="text-sm text-ink-500 mt-0.5">+1 (416) 555-0000 · Mon–Sat, 9 AM – 7 PM EST</p>
                  <p className="mt-2 text-sm text-emerald-700 font-medium">Tap to start chat →</p>
                </div>
              </a>
            </Reveal>
            <Reveal as="div" delay={0.05}>
              <a href="mailto:hello@avenir.ca" className="card card-pad card-hover flex items-start gap-4">
                <span className="w-12 h-12 rounded-xl bg-brand-50 text-brand-700 grid place-items-center flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900">Email</p>
                  <p className="text-sm text-ink-500 mt-0.5">hello@avenir.ca</p>
                  <p className="mt-2 text-sm text-brand-700 font-medium">We reply within 24 hours →</p>
                </div>
              </a>
            </Reveal>
            <Reveal as="div" delay={0.1} className="card card-pad">
              <p className="font-semibold text-ink-900">We reply within 24 hours</p>
              <p className="mt-2 text-sm text-ink-600">Most days you&apos;ll hear back the same business day. Outside of EST business hours we still confirm receipt and follow up with details next morning.</p>
            </Reveal>
          </aside>
        </div>
      </section>
    </>
  );
}
