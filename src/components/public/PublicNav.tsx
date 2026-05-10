'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'Home' },
  { href: '/courses', label: 'Courses' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' }
];

export function PublicNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (h: string) => h === '/' ? path === '/' : path.startsWith(h);
  return (
    <nav className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-ink-100">
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link key={l.href} href={l.href} className={cn('nav-link', isActive(l.href) && 'nav-link-active')}>{l.label}</Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Link href="/login" className="btn-ghost btn-md">Sign in</Link>
            <Link href="/apply" className="btn-primary btn-md">
              <span>Enrol now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <button onClick={() => setOpen(o => !o)} className="md:hidden p-2 -mr-2 rounded-lg hover:bg-ink-100" aria-label="Toggle menu">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="md:hidden pb-4 space-y-1"
            >
              {links.map(l => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={cn('block nav-link', isActive(l.href) && 'nav-link-active')}>{l.label}</Link>
              ))}
              <div className="pt-2 grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setOpen(false)} className="btn-secondary btn-md justify-center">Sign in</Link>
                <Link href="/apply" onClick={() => setOpen(false)} className="btn-primary btn-md justify-center">Enrol now</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
