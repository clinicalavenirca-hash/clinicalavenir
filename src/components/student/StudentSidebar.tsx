'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, GraduationCap, Briefcase, Kanban, FileText, User, LogOut } from 'lucide-react';
import type { Profile } from '@/lib/data';
import { Avatar } from '@/components/ui/Avatar';
import { signOut } from '@/app/actions/auth';
import { cn } from '@/lib/utils';

const links = [
  { group: 'Learning', items: [
    { href: '/student/dashboard',     label: 'Dashboard',      Icon: LayoutDashboard },
    { href: '/student/courses',       label: 'My Courses',     Icon: BookOpen },
    { href: '/student/interview-prep',label: 'Interview Prep', Icon: GraduationCap }
  ]},
  { group: 'Career', items: [
    { href: '/student/jobs',          label: 'Job Board',     Icon: Briefcase },
    { href: '/student/applications',  label: 'Tracker',       Icon: Kanban },
    { href: '/student/resume',        label: 'Resume Builder',Icon: FileText }
  ]},
  { group: 'Account', items: [
    { href: '/student/profile',       label: 'Profile',       Icon: User }
  ]}
];

export function StudentSidebar({ profile, onClose }: { profile: Profile; onClose?: () => void }) {
  const path = usePathname();
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-ink-100 hidden lg:block">
        <Link href="/student/dashboard" className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-brand-600 text-white grid place-items-center shadow-soft">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M12 2 L4 7 L12 12 L20 7 Z" /><path d="M4 12 L12 17 L20 12" /><path d="M4 17 L12 22 L20 17" />
            </svg>
          </span>
          <span className="font-display font-bold text-lg text-ink-900">Avenir</span>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scroll-thin">
        {links.map((group) => (
          <div key={group.group}>
            <p className="px-3 pt-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400">{group.group}</p>
            {group.items.map(({ href, label, Icon }) => {
              const active = path === href || (href !== '/student/dashboard' && path?.startsWith(href));
              return (
                <Link key={href} href={href} onClick={onClose} className={cn('side-link', active && 'side-link-active')}>
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-ink-100 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar name={profile.name} src={profile.avatar} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink-900 truncate">{profile.name}</p>
            <p className="text-xs text-ink-500 truncate">{profile.email}</p>
          </div>
        </div>
        <form action={signOut}>
          <button type="submit" className="w-full mt-1 side-link justify-start text-rose-600 hover:bg-rose-50 hover:text-rose-700">
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
