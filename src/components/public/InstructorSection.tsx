import Image from 'next/image';
import type { Instructor } from '@/lib/data';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Instructor introduction. Compact two-column layout — photo capped at a
 * fixed max-height on the left, bio + tight stat strip on the right.
 *
 * The bio is rendered with the instructor's first name stripped from the
 * leading word so the paragraph doesn't open with "Gopal" right after the
 * heading already shows "Gopal Chelikani" — reads like continuous prose
 * instead of an external explainer.
 */
export function InstructorSection({ instructor }: { instructor: Instructor }) {
  const bio = stripLeadingName(instructor.longBio, instructor.name);
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-ink-950 text-white relative overflow-hidden">
      {/* Soft decorative glows */}
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-accent-600 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-accent-500 blur-3xl" />
      </div>

      <div className="container-app relative">
        {/* Compact header */}
        <div className="mb-8 lg:mb-10 flex items-baseline justify-between flex-wrap gap-3">
          <div>
            <Reveal>
              <span className="eyebrow !text-accent-400">Meet your instructor</span>
            </Reveal>
            <Reveal delay={0.04}>
              <h2 className="mt-2 text-white text-2xl sm:text-3xl lg:text-4xl">
                From the <span className="font-serif italic font-normal text-accent-400">field</span>.
              </h2>
            </Reveal>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Photo — capped height so it doesn't dominate */}
          <Reveal className="lg:col-span-5">
            <div className="relative aspect-[4/5] max-h-[28rem] mx-auto lg:mx-0 rounded-2xl overflow-hidden shadow-soft-xl ring-1 ring-white/10">
              <Image
                src={instructor.photo}
                alt={instructor.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 80vw, 36vw"
              />
            </div>
          </Reveal>

          {/* Right column — name, title, condensed bio, stat strip, companies */}
          <div className="lg:col-span-7 space-y-5">
            <Reveal delay={0.04}>
              <div>
                <h3 className="text-white text-2xl sm:text-3xl font-display font-bold leading-tight">
                  {instructor.name}
                </h3>
                <p className="mt-1 text-accent-400 font-medium text-sm sm:text-base">
                  {instructor.title}
                </p>
              </div>
            </Reveal>

            {/* Bio — single paragraph, compact. First name stripped so the
                paragraph reads as continuation of the heading above. */}
            <Reveal delay={0.08}>
              <p className="text-ink-200 text-sm sm:text-base leading-relaxed max-w-2xl line-clamp-5">
                {bio}
              </p>
            </Reveal>

            {/* Stat strip — horizontal pill row with dividers */}
            <Reveal delay={0.12}>
              <dl className="flex flex-wrap items-stretch gap-y-3 rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur px-5 py-4">
                <StatItem label="Years" value={`${instructor.yearsExperience}+`} />
                <Divider />
                <StatItem label="Based in" value={instructor.location} />
                <Divider />
                <StatItem label="Specialization" value={instructor.specialization} flexible />
              </dl>
            </Reveal>

            {/* Education — single line */}
            <Reveal delay={0.16}>
              <p className="text-sm text-ink-300">
                <span className="text-ink-500 uppercase tracking-[0.18em] text-xs font-semibold mr-2">
                  Education
                </span>
                <span className="text-white">{instructor.education}</span>
              </p>
            </Reveal>

            {/* Past companies */}
            {instructor.pastCompanies.length > 0 && (
              <Reveal delay={0.2}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500 mr-1">
                    Worked across
                  </span>
                  {instructor.pastCompanies.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-medium ring-1 ring-white/15"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatItem({ label, value, flexible }: { label: string; value: string; flexible?: boolean }) {
  return (
    <div className={flexible ? 'flex-1 min-w-[7rem]' : 'min-w-[6rem]'}>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">{label}</dt>
      <dd className="mt-0.5 font-display text-base sm:text-lg font-bold text-white leading-tight">
        {value}
      </dd>
    </div>
  );
}

function Divider() {
  return <span className="w-px self-stretch bg-white/10 mx-4 sm:mx-5" aria-hidden />;
}

/**
 * Strip a leading instance of the instructor's first name from the bio so
 * the paragraph doesn't restart with the name that the heading above
 * already shows. "Gopal has spent the last 15 years…" → "Has spent the
 * last 15 years…". Capitalizes the new opening character so it still
 * reads as a proper sentence. Returns the bio unchanged if it doesn't
 * begin with the first name.
 */
function stripLeadingName(bio: string, fullName: string): string {
  if (!bio || !fullName) return bio;
  const firstName = fullName.split(' ')[0];
  if (!firstName) return bio;
  if (bio.startsWith(`${firstName} `)) {
    const rest = bio.slice(firstName.length + 1);
    return rest.charAt(0).toUpperCase() + rest.slice(1);
  }
  return bio;
}
