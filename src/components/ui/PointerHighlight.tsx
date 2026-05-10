'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * Hand-drawn-feeling marker circle that draws around its children when the
 * component enters the viewport. Adapted from style4 (PointerHighlight) but
 * stripped of the flying arrow + ResizeObserver. The circle is a single SVG
 * positioned absolutely over the children with a slight rotation to feel
 * handwritten, and it draws in via stroke-dasharray animation.
 *
 * Pass an `accent` prop to swap the stroke color.
 */
export function PointerHighlight({
  children,
  accent = 'accent'
}: {
  children: React.ReactNode;
  accent?: 'accent' | 'brand';
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const stroke = accent === 'accent' ? '#F25C42' : '#4F46E5';

  return (
    <span ref={ref} className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <motion.svg
        aria-hidden
        viewBox="0 0 100 50"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        style={{ transform: 'rotate(-1.2deg) scale(1.08)' }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.2, delay: 0.4 }}
      >
        <motion.path
          d="M 8 25 Q 8 6, 50 6 Q 92 6, 92 25 Q 92 44, 50 44 Q 8 44, 8 25"
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.45, ease: [0.65, 0, 0.35, 1] }}
        />
      </motion.svg>
    </span>
  );
}
