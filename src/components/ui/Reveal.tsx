'use client';
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'aside' | 'li';
};

export function Reveal({ children, delay = 0, className, as = 'div' }: Props) {
  const reduce = useReducedMotion();
  const Comp: any = motion[as] ?? motion.div;
  return (
    <Comp
      initial={reduce ? false : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px 0px' }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </Comp>
  );
}
