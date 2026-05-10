/**
 * Infinite horizontal marquee of company names where graduates have placed.
 * Pure CSS animation (no JS), with edge-fade masks so names slide cleanly
 * off the viewport instead of hard-cutting.
 */
const COMPANIES = [
  'IQVIA', 'Bayer', 'GSK', 'Veristat', 'Syneos Health', 'PPD',
  'Health Canada', 'AstraZeneca', 'Novartis', 'Sanofi', 'Pfizer', 'Apotex'
];

export function TrustMarquee() {
  return (
    <section className="border-y border-ink-200/70 bg-white overflow-hidden">
      <div className="container-app py-7">
        <p className="text-center text-xs uppercase tracking-[0.18em] font-semibold text-ink-500 mb-5">
          Graduates placed at
        </p>
        <div className="overflow-hidden">
          <ul className="marquee-track">
            {[...COMPANIES, ...COMPANIES].map((c, i) => (
              <li
                key={`${c}-${i}`}
                className="font-display font-bold text-lg sm:text-xl text-ink-400 hover:text-ink-950 transition-colors whitespace-nowrap"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
