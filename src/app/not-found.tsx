import Link from 'next/link';
import { PublicNav } from '@/components/public/PublicNav';
import { Footer } from '@/components/public/Footer';

export default function NotFound() {
  return (
    <>
      <PublicNav />
      <section className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-lg">
          <p className="eyebrow">404</p>
          <h1 className="mt-3">We couldn&apos;t find that page.</h1>
          <p className="mt-3 text-ink-600">The link may be outdated, or the page may have moved. Head back to the homepage and try again.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/" className="btn-primary btn-md">Back to home</Link>
            <Link href="/courses" className="btn-secondary btn-md">View courses</Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
