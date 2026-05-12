import Link from 'next/link';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  href: string;
  /** Course cover image — banner at the top of the card */
  cover: string;
  tagline: string;
  title: string;
  blurb: string;
  Icon: LucideIcon;
};

/**
 * Compact program card — image banner, a short uppercase track label,
 * bold title, two-line description, and a "View program" link. Sized as
 * a listing entry, not a hero card.
 */
export function ProgramCard({ href, cover, tagline, title, blurb, Icon }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col bg-white rounded-2xl overflow-hidden',
        'border border-ink-200 shadow-soft transition-all duration-300',
        'hover:border-ink-950 hover:shadow-soft-lg hover:-translate-y-0.5'
      )}
    >
      {/* 16:9 banner — matches the native aspect of typical course covers,
          so object-cover fills the box without cropping the top edge. */}
      <div className="relative aspect-[16/9] bg-ink-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      {/* Tight content — small chrome, big title + button. */}
      <div className="px-4 pt-3 pb-3.5">
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-ink-500">
          {tagline}
        </p>

        <h3 className="mt-1 text-lg sm:text-xl font-display font-bold text-ink-950 leading-tight tracking-tight">
          {title}
        </h3>

        <p className="mt-1.5 text-xs text-ink-600 leading-snug line-clamp-2">
          {blurb}
        </p>

        <div className="mt-3 flex justify-end">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ink-950 text-white text-sm font-semibold group-hover:gap-2.5 transition-all">
            View program
            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.4} />
          </span>
        </div>
      </div>
    </Link>
  );
}
