import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-gradient min-h-screen flex flex-col">
      <header className="container-app py-6 sm:py-8 flex items-center justify-between gap-4">
        <Logo />
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-700 hover:text-ink-900 px-3 py-2 rounded-lg hover:bg-white/60 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="container-app py-6 text-center text-sm text-ink-500">
        &copy; {new Date().getFullYear()} Avenir. All rights reserved.
      </footer>
    </div>
  );
}
