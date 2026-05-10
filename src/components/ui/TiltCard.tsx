'use client';
import { useRef, useState, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Cursor-tracked 3D-perspective tilt card. The inner content rotates on
 * X/Y axes based on the cursor's position relative to the card's center,
 * with a soft spring decay back to flat on leave. Drives a moving spotlight
 * highlight on top of the card.
 *
 * Built for the program/track cards on the home page. Inspired by style3's
 * folder mechanics but stripped of the folder skeuomorph.
 */
export function TiltCard({
  children,
  className,
  maxTilt = 8
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [maxTilt, -maxTilt]), { stiffness: 220, damping: 22 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-maxTilt, maxTilt]), { stiffness: 220, damping: 22 });
  const sx = useSpring(useTransform(mx, [-0.5, 0.5], [0, 100]), { stiffness: 180, damping: 22 });
  const sy = useSpring(useTransform(my, [-0.5, 0.5], [0, 100]), { stiffness: 180, damping: 22 });
  const spotlight = useTransform(
    [sx, sy],
    ([x, y]: number[]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(99,102,241,0.18), transparent 50%)`
  );

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function reset() {
    setHover(false);
    mx.set(0);
    my.set(0);
  }

  return (
    <div
      ref={ref}
      className={cn('tilt-card', className)}
      onPointerEnter={() => setHover(true)}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      <motion.div
        className="tilt-card-inner relative h-full w-full"
        style={{ rotateX: rx, rotateY: ry }}
      >
        {children}
        {/* Cursor-tracked spotlight overlay */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{ opacity: hover ? 1 : 0, background: spotlight }}
        />
      </motion.div>
    </div>
  );
}
