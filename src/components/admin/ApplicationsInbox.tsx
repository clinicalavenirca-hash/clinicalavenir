'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageCircle, Plus, Trash2, Loader2, Check } from 'lucide-react';
import type { Application, Course } from '@/lib/data';
import { cn, initials } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import {
  setApplicationStatus,
  deleteApplication,
  addCoursesFromApplication
} from '@/app/actions/applications';
import { CreateAccountModal } from '@/components/admin/CreateAccountModal';

const STATUSES = ['all', 'new', 'contacted', 'paid', 'declined'] as const;
type StatusFilter = typeof STATUSES[number];

export function ApplicationsInbox({ applications, courses }: { applications: Application[]; courses: Course[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<StatusFilter>('all');
  const [course, setCourse] = useState('');
  const [pending, startTransition] = useTransition();
  const [openCreateFor, setOpenCreateFor] = useState<Application | null>(null);

  const filtered = applications.filter((a) =>
    (status === 'all' || a.status === status) &&
    (!course || a.courses.includes(course))
  );

  const tone = (s: Application['status']) => ({ new: 'badge-accent', contacted: 'badge-brand', paid: 'badge-success', declined: 'badge-danger' }[s]);

  function changeStatus(id: string, next: Application['status']) {
    startTransition(async () => {
      const res = await setApplicationStatus(id, next);
      if (res?.error) { toast(res.error, 'error'); return; }
      toast(`Marked ${next}.`, 'success');
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!confirm('Delete this application? This cannot be undone.')) return;
    startTransition(async () => {
      const res = await deleteApplication(id);
      if (res?.error) { toast(res.error, 'error'); return; }
      toast('Application deleted.', 'info');
      router.refresh();
    });
  }

  function addCourses(id: string) {
    startTransition(async () => {
      const res = await addCoursesFromApplication(id);
      if (res?.error) { toast(res.error, 'error'); return; }
      toast('Courses added to existing student.', 'success');
      router.refresh();
    });
  }

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
          <select value={course} onChange={(e) => setCourse(e.target.value)} className="input !py-2 !text-sm !w-auto">
            <option value="">All courses</option>
            {courses.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((a, i) => (
          <motion.article key={a.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: i * 0.03 }} className="card overflow-hidden flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center text-xs font-semibold flex-shrink-0">{initials(a.studentName)}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-semibold text-ink-900 truncate">{a.studentName}</p>
                      {a.isExisting && <span className="badge-brand text-[10px]">Existing</span>}
                    </div>
                    <p className="text-xs text-ink-500">{a.email}</p>
                    <p className="text-xs text-ink-500">{a.countryCode} {a.phone}</p>
                  </div>
                </div>
                <span className={cn(tone(a.status), 'capitalize flex-shrink-0')}>{a.status}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {a.courses.map((slug) => {
                  const c = courses.find((cs) => cs.slug === slug);
                  return c ? <span key={slug} className="badge-ink text-[11px]">{c.title}</span> : <span key={slug} className="badge-ink text-[11px]">{slug}</span>;
                })}
              </div>

              {a.message && <p className="mt-3 text-sm text-ink-600 line-clamp-2 italic">&ldquo;{a.message}&rdquo;</p>}

              <div className="mt-4 bg-ink-50 rounded-lg p-2 text-xs">
                <p className="text-ink-500">Submitted</p>
                <p className="font-semibold text-ink-900 mt-0.5">{new Date(a.createdAt).toLocaleString('en-CA', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
              </div>
            </div>

            <div className="border-t border-ink-100 px-5 py-3 bg-ink-50/40 flex items-center gap-2 flex-wrap">
              <a href={`https://wa.me/${(a.countryCode + a.phone).replace(/\D/g, '')}`} target="_blank" rel="noopener" className="btn-ghost btn-sm !text-emerald-700 hover:!bg-emerald-50">
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>
              {a.status === 'new' && <button onClick={() => changeStatus(a.id, 'contacted')} disabled={pending} className="btn-ghost btn-sm">Mark contacted</button>}
              {a.status !== 'paid' && a.status !== 'declined' && <button onClick={() => changeStatus(a.id, 'paid')} disabled={pending} className="btn-ghost btn-sm">Mark payment received</button>}
              {a.status !== 'declined' && !a.authUserId && <button onClick={() => changeStatus(a.id, 'declined')} disabled={pending} className="btn-ghost btn-sm text-rose-600 hover:bg-rose-50">Decline</button>}
              <div className="flex-1" />
              <button onClick={() => remove(a.id)} disabled={pending} className="p-1.5 rounded hover:bg-rose-50 text-ink-400 hover:text-rose-600">
                {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
            {/* The CTA stays available until the admin actually creates the account
                (or links the existing student). Marking contacted/paid no longer
                hides this button — those are just status flags for tracking. */}
            {a.status !== 'declined' && !a.authUserId && (
              <button
                onClick={() => (a.isExisting ? addCourses(a.id) : setOpenCreateFor(a))}
                disabled={pending}
                className="px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" strokeWidth={2.5} />}
                {a.isExisting ? `Approve & add courses to ${a.studentName.split(' ')[0]}` : 'Approve & create account'}
              </button>
            )}
            {a.authUserId && (
              <div className="px-5 py-2.5 bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 border-t border-emerald-100">
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                Account created — visible in /admin/students
              </div>
            )}
          </motion.article>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full card card-pad text-center py-16">
            <p className="text-sm text-ink-500">No applications match the current filter.</p>
          </div>
        )}
      </div>

      {openCreateFor && (
        <CreateAccountModal application={openCreateFor} onClose={() => setOpenCreateFor(null)} />
      )}
    </>
  );
}
