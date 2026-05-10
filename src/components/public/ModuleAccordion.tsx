'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Play } from 'lucide-react';
import type { Module } from '@/lib/data';
import { cn } from '@/lib/utils';

export function ModuleAccordion({ modules }: { modules: Module[] }) {
  const [open, setOpen] = useState<number>(0);
  return (
    <div className="mt-6 space-y-3">
      {modules.map((m, i) => (
        <div key={m.id} className="card overflow-hidden">
          <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-4 min-w-0">
              <span className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 grid place-items-center font-bold flex-shrink-0">{i + 1}</span>
              <div className="min-w-0">
                <p className="text-xs text-ink-500 font-semibold uppercase tracking-wider">{m.week}</p>
                <p className="font-semibold text-ink-900 truncate">{m.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="hidden sm:inline-flex badge-ink">{m.videos.length} videos</span>
              <ChevronDown className={cn('w-5 h-5 text-ink-400 transition-transform', open === i && 'rotate-180')} />
            </div>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 border-t border-ink-100 pt-4">
                  <p className="text-ink-600 mb-4">{m.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {m.topics.map(t => <span key={t} className="badge-brand">{t}</span>)}
                  </div>
                  <ul className="space-y-2">
                    {m.videos.map(v => (
                      <li key={v.id} className="flex items-center gap-3 text-sm text-ink-700">
                        <span className="w-7 h-7 rounded-lg bg-ink-100 grid place-items-center"><Play className="w-3.5 h-3.5 text-ink-600" fill="currentColor" /></span>
                        <span className="flex-1 truncate">{v.title}</span>
                        <span className="text-xs text-ink-500 tabular-nums">{v.duration}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
