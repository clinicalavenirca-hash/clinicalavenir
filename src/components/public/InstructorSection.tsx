import Image from 'next/image';
import { Briefcase, MapPin, GraduationCap, FileCheck2 } from 'lucide-react';
import type { Instructor } from '@/lib/data';
import { Reveal } from '@/components/ui/Reveal';

export function InstructorSection({ instructor }: { instructor: Instructor }) {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-ink-900 text-white relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-600 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent-600 blur-3xl" />
      </div>

      <div className="container-app relative">
        <div className="max-w-2xl mb-12 lg:mb-16">
          <Reveal><span className="eyebrow !text-brand-400">Meet your instructor</span></Reveal>
          <Reveal delay={0.04}>
            <h2 className="mt-3 text-white">Real practitioner. Weekly office hours.</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-4 text-ink-200 text-lg leading-relaxed">
              Avenir isn&apos;t taught by career educators — it&apos;s taught by someone running submissions and trials right now.
            </p>
          </Reveal>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Photo + floating cards */}
          <Reveal className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-soft-xl ring-1 ring-white/10">
              <Image
                src={instructor.photo}
                alt={instructor.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">Currently</p>
                <p className="font-display font-bold text-lg mt-0.5 leading-tight">
                  {instructor.currentRole} · {instructor.currentCompany}
                </p>
              </div>
            </div>

            {/* Floating chip — top */}
            <div className="hidden sm:block absolute -top-4 -left-4 bg-white text-ink-900 rounded-2xl shadow-soft-lg p-4 max-w-[220px]">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-brand-50 grid place-items-center text-brand-700">
                  <FileCheck2 className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-xs text-ink-500">Submission types</p>
                  <p className="text-sm font-semibold leading-tight">NDS · SNDS · IND · NDA · BLA</p>
                </div>
              </div>
            </div>

            {/* Floating chip — bottom */}
            <div className="hidden sm:block absolute -bottom-4 -right-4 bg-white text-ink-900 rounded-2xl shadow-soft-lg p-4 max-w-[220px]">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-accent-50 grid place-items-center text-accent-700">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-xs text-ink-500">MSc</p>
                  <p className="text-sm font-semibold leading-tight">Northeastern University</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Bio block */}
          <div className="lg:col-span-7">
            <Reveal delay={0.04}>
              <h3 className="text-white text-3xl sm:text-4xl font-display font-bold leading-tight">
                {instructor.name}
              </h3>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-2 text-brand-300 font-medium">{instructor.title}</p>
            </Reveal>

            {/* Bio paragraph — split for readability */}
            <Reveal delay={0.12}>
              <div className="mt-6 space-y-4 text-ink-200 text-base sm:text-lg leading-relaxed max-w-2xl">
                {instructor.longBio.split('. ').reduce<string[]>((acc, sentence, i, arr) => {
                  // Split into two paragraphs at the midpoint sentence boundary
                  const idx = Math.ceil(arr.length / 2);
                  if (i < idx) acc[0] = (acc[0] ? acc[0] + '. ' : '') + sentence;
                  else acc[1] = (acc[1] ? acc[1] + '. ' : '') + sentence;
                  return acc;
                }, ['', '']).filter(Boolean).map((p, i) => (
                  <p key={i}>{p.trim()}{p.trim().endsWith('.') ? '' : '.'}</p>
                ))}
              </div>
            </Reveal>

            {/* Stat grid */}
            <Reveal delay={0.16}>
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Stat icon={<Briefcase className="w-4 h-4" />} label="Years experience" value={`${instructor.yearsExperience}+`} />
                <Stat icon={<Briefcase className="w-4 h-4" />} label="Current role" value={instructor.currentCompany} />
                <Stat icon={<MapPin className="w-4 h-4" />} label="Based in" value={instructor.location} />
              </div>
            </Reveal>

            {/* Education + Specialization */}
            <Reveal delay={0.2}>
              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                <InfoRow Icon={GraduationCap} label="Education" value={instructor.education} />
                <InfoRow Icon={FileCheck2} label="Specialization" value={instructor.specialization} />
              </div>
            </Reveal>

            {/* Past companies */}
            {instructor.pastCompanies.length > 0 && (
              <Reveal delay={0.24}>
                <div className="mt-8">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">Worked across</p>
                  <div className="flex flex-wrap gap-2">
                    {instructor.pastCompanies.map(c => (
                      <span key={c} className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium ring-1 ring-white/15">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-4">
      <div className="flex items-center gap-2 text-brand-300">
        {icon}
        <p className="text-xs font-medium uppercase tracking-wider">{label}</p>
      </div>
      <p className="mt-2 font-display text-2xl sm:text-3xl font-bold text-white tabular-nums">{value}</p>
    </div>
  );
}

function InfoRow({ Icon, label, value }: { Icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 flex items-start gap-3">
      <span className="w-9 h-9 flex-shrink-0 rounded-xl bg-brand-600/20 text-brand-300 grid place-items-center">
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-400">{label}</p>
        <p className="mt-0.5 text-sm text-white leading-snug">{value}</p>
      </div>
    </div>
  );
}
