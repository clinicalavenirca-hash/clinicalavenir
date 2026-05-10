import Link from 'next/link';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { TiltCard } from '@/components/ui/TiltCard';
import { cn } from '@/lib/utils';

type Props = {
  index: number;
  href: string;
  tagline: string;
  title: string;
  blurb: string;
  duration: string;
  seatsLine: string;
  Icon: LucideIcon;
};

/**
 * Editorial program card for the four career tracks. Combines a numbered
 * eyebrow, an icon mark, a tight title + blurb, and a meta strip. Hosted
 * in a TiltCard so it tilts toward the cursor.
 */
export function ProgramCard({ index, href, tagline, title, blurb, duration, seatsLine, Icon }: Props) {
  return (
    <TiltCard className="h-full">
      <Link
        href={href}
        className={cn(
          'group relative h-full block rounded-3xl bg-white border border-ink-200/70',
          'overflow-hidden p-6 sm:p-7 transition-shadow duration-300',
          'hover:border-ink-900/80 hover:shadow-soft-xl'
        )}
      >
        {/* Number stripe */}
        <div className="flex items-start justify-between">
          <span className="font-serif italic text-ink-400 text-lg leading-none">
            {String(index).padStart(2, '0')}
          </span>
          <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-ink-950 text-white shadow-soft">
            <Icon className="w-5 h-5" strokeWidth={1.8} />
          </span>
        </div>

        {/* Tagline + title */}
        <p className="mt-8 text-xs font-semibold tracking-[0.18em] uppercase text-brand-700">
          {tagline}
        </p>
        <h3 className="mt-2 text-2xl font-display font-bold text-ink-950 leading-tight">
          {title}
        </h3>
        <p className="mt-3 text-ink-600 text-sm leading-relaxed line-clamp-2">{blurb}</p>

        {/* Meta strip */}
        <div className="mt-8 pt-5 border-t border-ink-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-ink-500">
            <span className="font-medium text-ink-700">{duration}</span>
            <span className="w-1 h-1 rounded-full bg-ink-300" />
            <span>{seatsLine}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-ink-950 font-semibold group-hover:gap-2 transition-all">
            View <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.2} />
          </span>
        </div>

        {/* Bottom-edge accent line that grows on hover */}
        <span
          aria-hidden
          className="absolute left-6 right-6 bottom-0 h-px bg-gradient-to-r from-accent-500 via-brand-500 to-transparent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
        />
      </Link>
    </TiltCard>
  );
}
