import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ size = 'md', tone = 'brand', href = '/', className }: {
  size?: 'sm' | 'md';
  tone?: 'brand' | 'dark';
  href?: string;
  className?: string;
}) {
  const dims = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';
  const text = size === 'sm' ? 'text-base' : 'text-xl';
  const bg = tone === 'dark' ? 'bg-ink-900' : 'bg-brand-600';
  return (
    <Link href={href} className={cn('inline-flex items-center gap-2.5 group', className)}>
      <span className={cn('rounded-xl text-white grid place-items-center shadow-soft transition-transform group-hover:scale-105', dims, bg)}>
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M12 2 L4 7 L12 12 L20 7 Z" />
          <path d="M4 12 L12 17 L20 12" />
          <path d="M4 17 L12 22 L20 17" />
        </svg>
      </span>
      <span className={cn('font-display font-bold text-ink-900', text)}>Avenir</span>
    </Link>
  );
}
