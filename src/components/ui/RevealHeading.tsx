'use client';
import { motion, useInView } from 'framer-motion';
import { useRef, Fragment } from 'react';
import { cn } from '@/lib/utils';

/**
 * Per-letter spring-stagger entrance for section headings. Each character
 * animates in, but every word is wrapped in a `white-space: nowrap` shell
 * so the heading still breaks cleanly on spaces — never inside a word.
 *
 * Pass `accent` to wash specific substrings in the brand-accent color.
 */
export function RevealHeading({
  text,
  as: Tag = 'h2',
  className,
  accent,
  delay = 0
}: {
  text: string;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  accent?: string | string[];
  delay?: number;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const accents = accent ? (Array.isArray(accent) ? accent : [accent]) : [];

  // Split into ordered { text, accent } segments
  const segments: { text: string; accent: boolean }[] = [];
  if (accents.length === 0) {
    segments.push({ text, accent: false });
  } else {
    let rest = text;
    while (rest.length > 0) {
      const hit = accents
        .map((a) => ({ a, idx: rest.indexOf(a) }))
        .filter((x) => x.idx >= 0)
        .sort((x, y) => x.idx - y.idx)[0];
      if (!hit) { segments.push({ text: rest, accent: false }); break; }
      if (hit.idx > 0) segments.push({ text: rest.slice(0, hit.idx), accent: false });
      segments.push({ text: hit.a, accent: true });
      rest = rest.slice(hit.idx + hit.a.length);
    }
  }

  // Build a flat list of {kind, value, accent} tokens — either a word or a space.
  // Words become inline-block + nowrap shells so letters inside can animate without
  // letting the line break mid-word.
  type Token = { kind: 'word' | 'space'; value: string; accent: boolean };
  const tokens: Token[] = [];
  for (const seg of segments) {
    const parts = seg.text.split(/(\s+)/); // keeps separators
    for (const p of parts) {
      if (!p) continue;
      tokens.push({ kind: /\s/.test(p) ? 'space' : 'word', value: p, accent: seg.accent });
    }
  }

  let counter = 0;
  return (
    <Tag ref={ref} className={cn('reveal-text-wrap', className)} aria-label={text}>
      {tokens.map((tok, tIdx) => {
        if (tok.kind === 'space') {
          // Render a real space character so line breaks happen here.
          return <Fragment key={`s-${tIdx}`}> </Fragment>;
        }
        return (
          <span
            key={`w-${tIdx}`}
            className="inline-block whitespace-nowrap"
            aria-hidden
          >
            {Array.from(tok.value).map((ch) => {
              const i = counter++;
              return (
                <motion.span
                  key={`${tIdx}-${i}`}
                  className={cn('ch', tok.accent && 'text-accent-500')}
                  initial={{ y: '0.55em', opacity: 0, rotate: 4 }}
                  animate={inView ? { y: 0, opacity: 1, rotate: 0 } : {}}
                  transition={{
                    duration: 0.55,
                    delay: delay + i * 0.028,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                >
                  {ch}
                </motion.span>
              );
            })}
          </span>
        );
      })}
    </Tag>
  );
}
