/**
 * Editorial marquee band — oversized program names scroll horizontally with
 * a smooth, slow continuous motion. Acts as a typographic palette-cleanser
 * between sections.
 *
 * Adapted from style9's brutalist isometric stack but stripped of the
 * 60deg/-30deg skew transforms — straight horizontal scroll reads cleaner
 * on a regulated-careers brand. Each "term" pair is a track item with a
 * small accent star separator.
 */

const TERMS = [
  'PHARMACOVIGILANCE',
  'REGULATORY AFFAIRS',
  'CLINICAL RESEARCH',
  'CLINICAL DATA'
];

export function MarqueeBand() {
  return (
    <section
      aria-hidden
      className="border-y border-ink-900 bg-ink-950 text-white py-6 sm:py-8 overflow-hidden"
    >
      <div className="marquee-mask">
        <ul className="marquee-track">
          {[...TERMS, ...TERMS, ...TERMS].map((t, i) => (
            <li
              key={`${t}-${i}`}
              className="font-display font-bold tracking-[-0.02em] text-[clamp(2.5rem,6vw,5rem)] leading-none whitespace-nowrap flex items-center gap-12"
            >
              <span>{t}</span>
              <span className="font-serif italic text-accent-500 text-[clamp(2.5rem,6vw,5rem)] leading-none">
                ·
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
