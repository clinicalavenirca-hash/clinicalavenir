import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Premium CTA with a rotating conic-gradient ring and a deep-ink pill core.
 * Wraps a Next Link; pass `href` for navigation, or `onClick` for actions.
 *
 * The conic rotation is driven by CSS `@property --gradient-angle` (registered
 * in globals.css) — no JS, smooth at 6s/rev. Pairs with <Magnetic> for hover pull.
 */
export function ShinyButton({
  href,
  children,
  className,
  trailingIcon = <ArrowUpRight className="w-4 h-4" strokeWidth={2.2} />,
  size = 'md'
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  trailingIcon?: React.ReactNode;
  size?: 'md' | 'lg';
}) {
  const innerSize = size === 'lg' ? 'px-7 py-3.5 text-base' : 'px-5 py-2.5 text-sm';
  return (
    <Link href={href} className={cn('shiny-btn group', className)}>
      <span className={cn('shiny-inner', innerSize)}>
        <span>{children}</span>
        <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          {trailingIcon}
        </span>
      </span>
    </Link>
  );
}
