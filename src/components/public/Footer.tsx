import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { fetchCourses } from '@/lib/db/courses';

export async function Footer() {
  const courses = await fetchCourses();
  return (
    <footer className="bg-ink-900 text-ink-300 mt-20">
      <div className="container-app py-14 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="[&_span]:!text-white">
              <Logo />
            </div>
            <p className="mt-4 text-sm leading-relaxed">Career programs in Pharmacovigilance, Regulatory Affairs, Clinical Research, and Clinical Data Management — built for graduates entering the Canadian market.</p>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Programs</h4>
            <ul className="space-y-2.5 text-sm">
              {courses.map((c) => (
                <li key={c.id}>
                  <Link href={`/courses/${c.slug}`} className="hover:text-white">{c.title}</Link>
                </li>
              ))}
              {courses.length === 0 && (
                <li className="text-ink-500 italic">No programs published yet.</li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/courses" className="hover:text-white">All courses</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/login" className="hover:text-white">Student sign in</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Stay in the loop</h4>
            <p className="text-sm mb-3">Get notified when a new batch opens.</p>
            <form className="flex gap-2">
              <input type="email" placeholder="you@example.com" className="input bg-ink-800 border-ink-700 text-white placeholder:text-ink-500" />
              <button type="button" className="btn-primary btn-md flex-shrink-0">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-ink-400">&copy; {new Date().getFullYear()} Avenir. All rights reserved.</p>
          <div className="flex items-center gap-5 text-sm">
            <Link href="#" className="hover:text-white">Privacy</Link>
            <Link href="#" className="hover:text-white">Terms</Link>
            <Link href="#" className="hover:text-white">WhatsApp</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
