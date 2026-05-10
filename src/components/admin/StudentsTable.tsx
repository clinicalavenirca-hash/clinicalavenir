'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Search, MoreHorizontal } from 'lucide-react';
import type { Course, Student } from '@/lib/data';
import { Avatar } from '@/components/ui/Avatar';
import { cn, formatDate } from '@/lib/utils';

const STATUSES = ['all', 'active', 'inactive'] as const;

export function StudentsTable({ students, courses }: { students: Array<Student & { avatar?: string | null }>; courses: Course[] }) {
  const [status, setStatus] = useState<typeof STATUSES[number]>('all');
  const [q, setQ] = useState('');

  const filtered = students.filter((s) =>
    (status === 'all' || s.status === status) &&
    (q === '' || s.name.toLowerCase().includes(q.toLowerCase()) || s.email.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <>
      <div className="card card-pad mb-5">
        <div className="flex flex-wrap items-center gap-2">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className={cn('px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors', status === s ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-700 hover:bg-ink-200')}>
              {s}
            </button>
          ))}
          <div className="flex-1" />
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email…" className="input pl-9 !py-2 !text-sm" />
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto scroll-thin">
          <table className="table">
            <thead>
              <tr><th>Student</th><th>Courses</th><th>Phone</th><th>Joined</th><th>Status</th><th className="text-right">Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} src={s.avatar ?? null} size="sm" />
                      <div className="min-w-0">
                        <Link href={`/admin/students/${s.id}`} className="font-semibold text-ink-900 text-sm hover:text-brand-700 truncate block">{s.name}</Link>
                        <p className="text-xs text-ink-500 truncate">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {s.courses.map((slug) => {
                        const c = courses.find((c) => c.slug === slug);
                        return c ? <span key={slug} className="badge-ink text-[11px]">{c.title}</span> : null;
                      })}
                      {s.courses.length === 0 && <span className="text-xs text-ink-400">No courses</span>}
                    </div>
                  </td>
                  <td className="text-sm text-ink-600 whitespace-nowrap">{s.phone || '—'}</td>
                  <td className="text-sm text-ink-600 whitespace-nowrap">{formatDate(s.joinedAt, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td>{s.status === 'active' ? <span className="badge-success">Active</span> : <span className="badge-ink">Inactive</span>}</td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/students/${s.id}`} className="btn-ghost btn-sm">View</Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center text-sm text-ink-500">No students match the current filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
