'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Inbox, Users, BookOpen, Briefcase, Quote, MessageSquare, HelpCircle, LogOut } from 'lucide-react';
import type { Profile } from '@/lib/data';
import { signOut } from '@/app/actions/auth';
import { initials, cn } from '@/lib/utils';

const links = [
  { href: '/admin/dashboard',    label: 'Overview',     Icon: LayoutGrid },
  { href: '/admin/applications', label: 'Applications', Icon: Inbox },
  { href: '/admin/messages',     label: 'Messages',     Icon: MessageSquare },
  { href: '/admin/students',     label: 'Students',     Icon: Users }
];
const catalog = [
  { href: '/admin/courses', label: 'Courses', Icon: BookOpen },
  { href: '/admin/jobs',    label: 'Jobs',    Icon: Briefcase },
  { href: '/admin/stories', label: 'Stories', Icon: Quote },
  { href: '/admin/faqs',    label: 'FAQs',    Icon: HelpCircle }
];

export function AdminSidebar({ profile, onClose }: { profile: Profile; onClose?: () => void }) {
  const path = usePathname();
  const active = (h: string) => path === h || (h !== '/admin/dashboard' && path?.startsWith(h));
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-white/10 hidden lg:block">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.jpg" alt="" className="w-9 h-9 rounded-lg" />
          <span className="font-display font-bold text-lg">Avenir <span className="text-brand-400">Admin</span></span>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scroll-thin">
        {links.map(({ href, label, Icon }) => (
          <Link key={href} href={href} onClick={onClose} className={cn('flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors', active(href) ? 'bg-brand-600 text-white' : 'text-ink-200 hover:bg-white/10 hover:text-white')}>
            <span className="flex items-center gap-3"><Icon className="w-5 h-5" />{label}</span>
          </Link>
        ))}
        <p className="px-3 pt-5 pb-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400">Catalog</p>
        {catalog.map(({ href, label, Icon }) => (
          <Link key={href} href={href} onClick={onClose} className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors', active(href) ? 'bg-brand-600 text-white' : 'text-ink-200 hover:bg-white/10 hover:text-white')}>
            <Icon className="w-5 h-5" />{label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <span className="w-9 h-9 rounded-full bg-brand-600 grid place-items-center text-sm font-semibold">{initials(profile.name)}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{profile.name}</p>
            <p className="text-xs text-ink-400 truncate">{profile.email}</p>
          </div>
        </div>
        <form action={signOut}>
          <button type="submit" className="w-full mt-1 flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 transition-colors">
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
