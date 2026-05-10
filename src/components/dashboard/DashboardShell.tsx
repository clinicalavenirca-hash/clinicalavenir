'use client';
import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import type { Profile } from '@/lib/data';
import { Avatar } from '@/components/ui/Avatar';
import { initials, cn } from '@/lib/utils';

type Props = {
  variant: 'student' | 'admin';
  profile: Profile;
  sidebar: ReactNode;
  children: ReactNode;
};

export function DashboardShell({ variant, profile, sidebar, children }: Props) {
  const [open, setOpen] = useState(false);
  const isAdmin = variant === 'admin';

  return (
    <div className="bg-ink-50 min-h-screen">
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-ink-100">
        <div className="px-4 h-14 flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-ink-100" aria-label="Open menu">
            <Menu className="w-6 h-6" />
          </button>
          <Link href={isAdmin ? '/admin/dashboard' : '/student/dashboard'} className="flex items-center gap-2">
            <span className={cn('w-8 h-8 rounded-lg text-white grid place-items-center', isAdmin ? 'bg-ink-900' : 'bg-brand-600')}>
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M12 2 L4 7 L12 12 L20 7 Z" />
              </svg>
            </span>
            <span className="font-display font-bold text-ink-900">
              Avenir{isAdmin && <span className="text-brand-600"> Admin</span>}
            </span>
          </Link>
          {isAdmin ? (
            <span className="w-8 h-8 rounded-full bg-ink-200 grid place-items-center text-xs font-semibold">{initials(profile.name)}</span>
          ) : (
            <Avatar name={profile.name} src={profile.avatar} size="sm" />
          )}
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div key="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="lg:hidden fixed inset-0 z-40 bg-ink-900/40" onClick={() => setOpen(false)} />
            <motion.aside key="drawer" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }} className={cn('lg:hidden fixed inset-y-0 left-0 z-50 w-72 shadow-soft-xl overflow-y-auto', isAdmin ? 'bg-ink-900 text-white' : 'bg-white')}>
              <div className={cn('px-5 py-4 flex items-center justify-between', isAdmin ? 'border-b border-white/10' : 'border-b border-ink-100')}>
                <span className="font-display font-bold">Avenir{isAdmin && <span className="text-brand-400"> Admin</span>}</span>
                <button onClick={() => setOpen(false)} className={cn('p-2 -mr-2 rounded-lg', isAdmin ? 'hover:bg-white/10' : 'hover:bg-ink-100')}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div onClick={() => setOpen(false)}>{sidebar}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:flex">
        <aside className={cn('hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 z-20', isAdmin ? 'bg-ink-900 text-white' : 'bg-white border-r border-ink-100')}>
          {sidebar}
        </aside>
        <main className="flex-1 lg:pl-64">
          <div className="p-4 sm:p-6 lg:p-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
