'use client';
import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Toast = { id: number; message: string; type: 'success' | 'error' | 'info' | 'warning' };

let pushFn: ((t: Omit<Toast, 'id'>) => void) | null = null;

export function toast(message: string, type: Toast['type'] = 'info') {
  pushFn?.({ message, type });
}

/**
 * Editorial toast — every variant uses the same ink-950 body with a small
 * colored dot on the left signalling type. Removes the green/emerald success
 * variant which read as too "clinical" against the indigo/coral brand.
 */
const dotMap = {
  success: 'bg-emerald-400',
  error:   'bg-rose-500',
  info:    'bg-brand-300',
  warning: 'bg-amber-400'
} as const;

const iconClass = 'w-4 h-4 mt-0.5 text-white/80';
const Icon = ({ type }: { type: Toast['type'] }) => {
  if (type === 'success') return <CheckCircle2 className={iconClass} strokeWidth={2.2} />;
  if (type === 'error') return <AlertTriangle className={iconClass} strokeWidth={2.2} />;
  if (type === 'warning') return <AlertTriangle className={iconClass} strokeWidth={2.2} />;
  return <Info className={iconClass} strokeWidth={2.2} />;
};

export function ToastHost() {
  const [items, setItems] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    pushFn = (t) => {
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { id, ...t }]);
      setTimeout(() => remove(id), 4500);
    };
    return () => {
      pushFn = null;
    };
  }, [remove]);

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto max-w-sm bg-ink-950 text-white px-4 py-3 rounded-xl shadow-soft-lg ring-1 ring-white/10 flex items-start gap-3"
          >
            <span className="relative mt-1 flex-shrink-0">
              <span className={cn('block w-2 h-2 rounded-full', dotMap[t.type])} />
              <span
                className={cn(
                  'absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-40',
                  dotMap[t.type]
                )}
              />
            </span>
            <Icon type={t.type} />
            <span className="flex-1 text-sm leading-snug">{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              className="text-white/60 hover:text-white transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
