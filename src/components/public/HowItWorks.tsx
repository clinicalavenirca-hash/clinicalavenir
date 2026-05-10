'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mail, Headphones, BookOpen, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    label: 'Apply',
    Icon: Mail,
    title: 'Tell us about you.',
    body: 'Pick a program, share your background. Two minutes.'
  },
  {
    label: 'Interview',
    Icon: Headphones,
    title: 'Quick call with admissions.',
    body: 'A 20-minute fit chat. We confirm the right track for your goals.'
  },
  {
    label: 'Learn',
    Icon: BookOpen,
    title: 'Live cohort + 1:1 reviews.',
    body: 'Eight weeks of live sessions, hands-on labs, and feedback from working leads.'
  },
  {
    label: 'Get hired',
    Icon: Briefcase,
    title: 'Land your first regulated role.',
    body: 'Job board, resume builder, interview prep — until you sign the offer.'
  }
];

/**
 * Sequential journey stepper. As the section scrolls into view, the active
 * step advances on a timer through the four phases, with a progress rail
 * that fills behind the active dot. Cards beneath update in sync.
 *
 * Pattern inspired by style5's animated stepper but reframed as a content
 * section ("how it works") rather than a checkout indicator.
 */
export function HowItWorks() {
  const root = useRef<HTMLElement>(null);
  const inView = useInView(root, { once: true, margin: '0px 0px -20% 0px' });
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => {
      setActive((a) => (a + 1) % STEPS.length);
    }, 2800);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <section ref={root} className="py-20 sm:py-28 bg-ink-50">
      <div className="container-app">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mb-12 items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow-serif">— How it works</p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-ink-950 leading-[1.1]">
              From application to offer — four steps.
            </h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="text-ink-600 text-base sm:text-lg leading-relaxed">
              No paperwork mazes. No payment until your application is reviewed.
            </p>
          </div>
        </div>

        {/* Rail + dots */}
        <div className="relative mb-12 sm:mb-16">
          {/* Track */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-ink-200" />
          {/* Filled portion */}
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-px bg-ink-950 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: inView ? (active + 1) / STEPS.length : 0 }}
            transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
            style={{ width: '100%' }}
          />
          <ol className="relative grid grid-cols-4 gap-2 sm:gap-4">
            {STEPS.map((step, i) => {
              const isActive = i === active;
              const isDone = i < active;
              return (
                <li key={step.label} className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    className={cn(
                      'w-10 h-10 sm:w-12 sm:h-12 rounded-full grid place-items-center border-2 transition-all duration-500 z-10',
                      isActive
                        ? 'bg-ink-950 border-ink-950 text-white scale-110 shadow-soft-lg'
                        : isDone
                        ? 'bg-ink-950 border-ink-950 text-white'
                        : 'bg-white border-ink-300 text-ink-400'
                    )}
                    aria-label={`Jump to step ${i + 1}: ${step.label}`}
                  >
                    <step.Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                  </button>
                  <span
                    className={cn(
                      'mt-3 text-xs sm:text-sm font-semibold transition-colors duration-300',
                      isActive ? 'text-ink-950' : 'text-ink-500'
                    )}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Active step card */}
        <div className="relative min-h-[180px] sm:min-h-[160px]">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.label}
              className="absolute inset-0 grid sm:grid-cols-12 gap-6 sm:gap-10 items-start"
              initial={false}
              animate={{
                opacity: i === active ? 1 : 0,
                y: i === active ? 0 : 12,
                pointerEvents: i === active ? 'auto' : 'none'
              }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="sm:col-span-2">
                <p className="font-serif italic text-ink-400 text-lg leading-none">
                  {String(i + 1).padStart(2, '0')}
                </p>
              </div>
              <div className="sm:col-span-6">
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-ink-950 leading-tight">
                  {step.title}
                </h3>
              </div>
              <div className="sm:col-span-4">
                <p className="text-ink-600 leading-relaxed">{step.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
