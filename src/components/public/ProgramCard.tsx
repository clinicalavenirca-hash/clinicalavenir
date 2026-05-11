import Link from 'next/link';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { TiltCard } from '@/components/ui/TiltCard';
import { cn } from '@/lib/utils';

type Props = {
  index: number;
  href: string;
  cover: string;
  tagline: string;
  title: string;
  blurb: string;
  duration: string;
  seatsLine: string;
  Icon: LucideIcon;
};

/**
 * Magazine-cover program card. The course cover image is the full-bleed
 * backdrop at a landscape 4:3 ratio (compact, not portrait-tall). All copy
 * — tagline, title, blurb, meta — is overlaid on the image with a strong
 * dark ink-950 gradient anchored to the bottom for legibility.
 */
export function ProgramCard({ index, href, cover, tagline, title, blurb, duration, seatsLine, Icon }: Props) {
  return (
    <TiltCard className="h-full">
      <Link
        href={href}
        className={cn(
          'group relative block w-full rounded-3xl overflow-hidden bg-ink-900',
          'aspect-[16/10]',
          'ring-1 ring-ink-200 transition-all duration-500',
          'hover:ring-ink-950 hover:shadow-soft-xl'
        )}
      >
        {/* Cover image — full bleed */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
        />

        {/* Heavy bottom gradient for content legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/80 to-ink-950/10" />

        {/* Top row — icon mark (left) + oversized serif numeral (right) */}
        <div className="absolute inset-x-4 sm:inset-x-5 top-4 sm:top-5 flex items-start justify-between">
          <span className="inline-flex w-9 h-9 rounded-xl bg-white/15 backdrop-blur ring-1 ring-white/30 text-white items-center justify-center">
            <Icon className="w-4 h-4" strokeWidth={1.8} />
          </span>
          <span className="font-serif italic text-white text-4xl sm:text-5xl leading-none tracking-tight select-none -mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            {String(index).padStart(2, '0')}
          </span>
        </div>

        {/* Bottom content — tagline → title → blurb → meta strip */}
        <div className="absolute inset-x-4 sm:inset-x-5 bottom-4 sm:bottom-5 text-white">
          <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-accent-400">
            {tagline}
          </p>
          <h3 className="mt-1 text-lg sm:text-xl font-display font-bold leading-[1.1] tracking-tight">
            {title}
          </h3>
          <p className="mt-1.5 text-xs text-white/70 leading-relaxed line-clamp-1 max-w-prose">
            {blurb}
          </p>
          <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-white/85">
              <span className="font-semibold">{duration}</span>
              <span className="w-1 h-1 rounded-full bg-white/40" aria-hidden />
              <span>{seatsLine}</span>
            </div>
            <span className="inline-flex items-center gap-1 font-semibold group-hover:gap-2 transition-all">
              <span className="hidden sm:inline">View</span>
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.2} />
            </span>
          </div>
        </div>

        {/* Coral accent line at bottom — grows on hover */}
        <span
          aria-hidden
          className="absolute left-0 right-0 bottom-0 h-[3px] bg-accent-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700"
        />
      </Link>
    </TiltCard>
  );
}
