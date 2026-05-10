import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ size = 'md', href = '/', className }: {
  size?: 'sm' | 'md';
  /** Kept for backwards compat with existing callers — no longer used now that the logo is an image. */
  tone?: 'brand' | 'dark';
  href?: string;
  className?: string;
}) {
  return (
    <Link href={href} className={cn('inline-flex items-center group', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="Avenir"
        className={cn(
          'w-auto transition-transform group-hover:scale-105',
          size === 'sm' ? 'h-8' : 'h-10'
        )}
      />
    </Link>
  );
}
