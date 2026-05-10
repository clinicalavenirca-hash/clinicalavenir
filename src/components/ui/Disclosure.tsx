'use client';
import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Accordion({ items, kind = 'plus' }: { items: { q: string; a: ReactNode }[]; kind?: 'plus' | 'chevron' }) {
  const [open, setOpen] = useState<number>(0);
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="card overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? -1 : i)}
            className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left"
          >
            <span className="font-semibold text-ink-900 text-base sm:text-lg pr-4">{it.q}</span>
            <span className="flex-shrink-0">
              {kind === 'plus'
                ? <Plus className={cn('w-5 h-5 text-ink-400 transition-transform', open === i && 'rotate-45')} />
                : <ChevronDown className={cn('w-5 h-5 text-ink-400 transition-transform', open === i && 'rotate-180')} />}
            </span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-4 border-t border-ink-100 text-ink-600 leading-relaxed">
                  {it.a}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
