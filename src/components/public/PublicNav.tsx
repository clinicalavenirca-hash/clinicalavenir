'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';
import { ShinyButton } from '@/components/ui/ShinyButton';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'Home' },
  { href: '/courses', label: 'Programs' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' }
];

/**
 * Public site nav. Sticky-glass once scrolled past hero. Active-link underline
 * is a Framer layout-id pill so the indicator slides smoothly between links.
 */
export function PublicNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (h: string) => (h === '/' ? path === '/' : path.startsWith(h));

  return (
    <nav
      className={cn(
        'sticky top-0 z-30 transition-all duration-300',
        scrolled
          ? 'bg-white/80 backdrop-blur-lg border-b border-ink-200/70 supports-[backdrop-filter]:bg-white/65'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <div className="container-app">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Logo />

          {/* Desktop links with sliding indicator */}
          <div className="hidden md:flex items-center gap-1 relative">
            {links.map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'relative px-4 py-2 text-sm font-medium transition-colors rounded-full',
                    active ? 'text-ink-950' : 'text-ink-600 hover:text-ink-950'
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-0 -z-0 rounded-full bg-ink-100"
                      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    />
                  )}
                  <span className="relative z-10">{l.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link href="/login" className="text-sm font-medium text-ink-700 hover:text-ink-950">
              Sign in
            </Link>
            <ShinyButton href="/apply">Apply</ShinyButton>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="md:hidden p-2 -mr-2 rounded-lg hover:bg-ink-100"
            aria-label="Toggle menu"
          >
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
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive(l.href)
                      ? 'bg-ink-100 text-ink-950'
                      : 'text-ink-700 hover:bg-ink-100 hover:text-ink-950'
                  )}
                >
                  {l.label}
                </Link>
              ))}
              <div className="pt-2 grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="btn-secondary btn-md justify-center"
                >
                  Sign in
                </Link>
                <Link
                  href="/apply"
                  onClick={() => setOpen(false)}
                  className="btn-primary btn-md justify-center"
                >
                  Apply
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
