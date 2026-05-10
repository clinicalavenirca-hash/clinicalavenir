'use client';
import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Hover-attracted wrapper. The child element drifts toward the cursor
 * within the wrapper's bounds, then snaps back on leave. Pairs with
 * `.shiny-btn` and primary CTAs to add Awwwards-style polish.
 */
export function Magnetic({
  children,
  strength = 18,
  className
}: {
  children: ReactNode;
  /** Max pixel offset toward the cursor at the edge of the wrapper. Higher = more pull. */
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 180, damping: 18, mass: 0.4 });
  const y = useSpring(my, { stiffness: 180, damping: 18, mass: 0.4 });
  const tx = useTransform(x, (v) => `${v}px`);
  const ty = useTransform(y, (v) => `${v}px`);

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    mx.set(dx * strength);
    my.set(dy * strength);
  }
  function reset() { mx.set(0); my.set(0); }

  return (
    <span
      ref={ref}
      className={`magnetic ${className ?? ''}`}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      <motion.span style={{ x: tx, y: ty, display: 'inline-block' }}>{children}</motion.span>
    </span>
  );
}
