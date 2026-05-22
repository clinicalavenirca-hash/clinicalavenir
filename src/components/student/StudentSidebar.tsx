'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, GraduationCap, Briefcase, Kanban, FileText, User, LogOut, BrainCircuit } from 'lucide-react';
import type { Profile } from '@/lib/data';
import { Avatar } from '@/components/ui/Avatar';
import { signOut } from '@/app/actions/auth';
import { cn } from '@/lib/utils';

/** A profile is considered "complete" when the fields used by the AI
 *  resume tailor and admin records are all present. Missing any of these
 *  triggers the red dot on the sidebar Profile link. */
function isProfileIncomplete(p: Profile): boolean {
  return !p.name?.trim()
    || !p.phone?.trim()
    || !p.country?.trim()
    || !p.linkedinUrl?.trim();
}

const links = [
  { group: 'Learning', items: [
    { href: '/student/dashboard',     label: 'Dashboard',      Icon: LayoutDashboard },
    { href: '/student/interview-prep',label: 'Interview Prep', Icon: GraduationCap }
  ]},
  { group: 'Career', items: [
    { href: '/student/jobs',          label: 'Job Board',     Icon: Briefcase },
    { href: '/student/applications',  label: 'Tracker',       Icon: Kanban },
    { href: '/student/resume',        label: 'Resume Builder',Icon: FileText },
    { href: '/student/ai-assistant',  label: 'AI Assistant',  Icon: BrainCircuit }
  ]},
  { group: 'Account', items: [
    { href: '/student/profile',       label: 'Profile',       Icon: User }
  ]}
];

export function StudentSidebar({ profile, onClose }: { profile: Profile; onClose?: () => void }) {
  const path = usePathname();
  const incomplete = isProfileIncomplete(profile);
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-ink-100 hidden lg:block">
        <Link href="/student/dashboard" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.jpg" alt="" className="w-9 h-9 rounded-lg" />
          <span className="font-display font-bold text-lg text-ink-900">Avenir</span>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scroll-thin">
        {links.map((group) => (
          <div key={group.group}>
            <p className="px-3 pt-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400">{group.group}</p>
            {group.items.map(({ href, label, Icon }) => {
              const active = path === href || (href !== '/student/dashboard' && path?.startsWith(href));
              const showDot = href === '/student/profile' && incomplete;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={cn('side-link justify-between', active && 'side-link-active')}
                  aria-label={showDot ? `${label} — incomplete` : undefined}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    {label}
                  </span>
                  {showDot && (
                    <span
                      className="relative inline-flex w-2.5 h-2.5 flex-shrink-0"
                      title="Your profile is incomplete"
                    >
                      <span className="absolute inset-0 rounded-full bg-rose-500" />
                      <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-40" />
                    </span>
                  )}
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
