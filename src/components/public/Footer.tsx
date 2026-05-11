import Link from 'next/link';
import { fetchCourses } from '@/lib/db/courses';

/**
 * Public site footer. Editorial dark slab with oversized wordmark, neat
 * three-column nav, and an inline newsletter capture. Renders the
 * /logo.png as a small mark, with a large wordmark below for grandeur.
 */
export async function Footer() {
  const courses = await fetchCourses();
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink-950 text-ink-300 mt-24 relative overflow-hidden">
      {/* Subtle grid lines backdrop */}
      <div className="absolute inset-0 grid-lines opacity-40 pointer-events-none" aria-hidden />
      {/* Top edge accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" aria-hidden />

      <div className="container-app py-16 sm:py-20 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand block */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Avenir" className="h-16 sm:h-20 w-auto" />
            </Link>
            <p className="mt-6 text-sm leading-relaxed max-w-sm text-ink-400">
              Live cohorts in Pharmacovigilance, Regulatory Affairs, Clinical Research, and Clinical Data Management — built for graduates entering the Canadian market.
            </p>
          </div>

          {/* Nav columns */}
          <div className="lg:col-span-3">
            <h4 className="text-white text-xs font-semibold tracking-[0.18em] uppercase mb-5">Programs</h4>
            <ul className="space-y-3 text-sm">
              {courses.map((c) => (
                <li key={c.id}>
                  <Link href={`/courses/${c.slug}`} className="text-ink-400 hover:text-white transition-colors">
                    {c.title}
                  </Link>
                </li>
              ))}
              {courses.length === 0 && <li className="text-ink-600 italic">No programs published yet.</li>}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white text-xs font-semibold tracking-[0.18em] uppercase mb-5">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/courses" className="text-ink-400 hover:text-white">All programs</Link></li>
              <li><Link href="/faq" className="text-ink-400 hover:text-white">FAQ</Link></li>
              <li><Link href="/contact" className="text-ink-400 hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white text-xs font-semibold tracking-[0.18em] uppercase mb-5">Account</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/login" className="text-ink-400 hover:text-white">Sign in</Link></li>
              <li><Link href="/apply" className="text-ink-400 hover:text-white">Apply</Link></li>
              <li><Link href="/admin-login" className="text-ink-400 hover:text-white">Admin</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-16 pt-8 border-t border-ink-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-ink-500">
          <p>&copy; {year} Clinical Avenir Solutions. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-white">Privacy</Link>
            <Link href="#" className="hover:text-white">Terms</Link>
            <Link href="/contact" className="hover:text-white">WhatsApp</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
