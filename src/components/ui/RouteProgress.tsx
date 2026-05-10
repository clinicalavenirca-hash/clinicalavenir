'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Thin progress bar at the very top of the viewport. Fires when the user
 * clicks an internal link and ends when the new pathname / search params
 * actually render. Purely visual — no router-event hooks (App Router
 * doesn't expose them), so we just intercept clicks and watch for the
 * usePathname value to change.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const lastKey = useRef<string>(`${pathname}?${searchParams?.toString() ?? ''}`);

  useEffect(() => {
    const key = `${pathname}?${searchParams?.toString() ?? ''}`;
    if (key === lastKey.current) return;
    lastKey.current = key;
    if (active) {
      setFinishing(true);
      const t = setTimeout(() => {
        setActive(false);
        setFinishing(false);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [pathname, searchParams, active]);

  useEffect(() => {
    function start(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (a.target && a.target !== '_self') return;
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      } catch {
        return;
      }
      setActive(true);
      setFinishing(false);
    }
    document.addEventListener('click', start, true);
    return () => document.removeEventListener('click', start, true);
  }, []);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="route-progress"
          className="fixed top-0 left-0 right-0 z-[100] pointer-events-none h-0.5"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          <motion.div
            className="h-full bg-accent-500 shadow-[0_0_8px_rgba(242,92,66,0.6)]"
            initial={{ width: '0%' }}
            animate={{ width: finishing ? '100%' : '90%' }}
            transition={{ duration: finishing ? 0.2 : 6, ease: 'easeOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
