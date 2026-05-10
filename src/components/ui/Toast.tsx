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

const toneMap = {
  success: 'bg-emerald-600',
  error:   'bg-rose-600',
  info:    'bg-ink-900',
  warning: 'bg-amber-600'
} as const;

const Icon = ({ type }: { type: Toast['type'] }) => {
  if (type === 'success') return <CheckCircle2 className="w-4 h-4 mt-0.5" />;
  if (type === 'error') return <AlertTriangle className="w-4 h-4 mt-0.5" />;
  if (type === 'warning') return <AlertTriangle className="w-4 h-4 mt-0.5" />;
  return <Info className="w-4 h-4 mt-0.5" />;
};

export function ToastHost() {
  const [items, setItems] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setItems(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    pushFn = (t) => {
      const id = Date.now() + Math.random();
      setItems(prev => [...prev, { id, ...t }]);
      setTimeout(() => remove(id), 4500);
    };
    return () => { pushFn = null; };
  }, [remove]);

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {items.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={cn('pointer-events-auto max-w-sm text-white px-4 py-3 rounded-xl shadow-soft-lg flex items-start gap-3', toneMap[t.type])}
          >
            <Icon type={t.type} />
            <span className="flex-1 text-sm">{t.message}</span>
            <button onClick={() => remove(t.id)} className="text-white/70 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
