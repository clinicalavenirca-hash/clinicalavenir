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
 * Clean program card in the spirit of Coursera / LinkedIn Learning:
 * unobstructed image banner up top, generous white content area below,
 * small icon + uppercase track label, big title, two-line blurb, and a
 * "View program" CTA at the bottom. No 3D tilt, no cursor spotlight,
 * no dark overlay washing out the cover image.
 */
export function ProgramCard({ href, cover, tagline, title, blurb, Icon }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col bg-white rounded-2xl overflow-hidden',
        'border border-ink-200 transition-all duration-300',
        'hover:border-ink-950 hover:shadow-soft-lg hover:-translate-y-0.5'
      )}
    >
      {/* Image banner — uncovered, just the photo */}
      <div className="relative aspect-[16/10] bg-ink-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>

      {/* Content area — white, generous padding */}
      <div className="flex-1 flex flex-col p-6 sm:p-7">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex w-9 h-9 rounded-xl bg-ink-100 text-ink-700 items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4" strokeWidth={1.8} />
          </span>
          <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-ink-500">
            {tagline}
          </p>
        </div>

        <h3 className="mt-4 text-xl sm:text-2xl font-display font-bold text-ink-950 leading-snug tracking-tight">
          {title}
        </h3>

        <p className="mt-3 text-sm text-ink-600 leading-relaxed line-clamp-2 flex-1">
          {blurb}
        </p>

        <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-950 group-hover:gap-3 transition-all self-start">
          View program
          <ArrowUpRight className="w-4 h-4" strokeWidth={2.2} />
        </div>
      </div>
    </Link>
  );
}
