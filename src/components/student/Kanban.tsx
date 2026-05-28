'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MoreHorizontal, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Job, JobApplication } from '@/lib/data';
import { cn, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { moveJobApplicationStatus, deleteJobApplication } from '@/app/actions/jobApplications';

const COLS = [
  { id: 'applied',   label: 'Applied',   stripe: 'bg-ink-300',     tone: 'badge-ink'      },
  { id: 'interview', label: 'Interview', stripe: 'bg-brand-500',   tone: 'badge-brand'    },
  { id: 'offer',     label: 'Offer',     stripe: 'bg-emerald-500', tone: 'badge-success'  },
  { id: 'rejected',  label: 'Rejected',  stripe: 'bg-rose-500',    tone: 'badge-danger'   }
] as const;

type Status = JobApplication['status'];

export function Kanban({ initial, jobs }: { initial: JobApplication[]; jobs: Job[] }) {
  const router = useRouter();
  const [apps, setApps] = useState<JobApplication[]>(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<Status | null>(null);
  const [pending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  function move(id: string, status: Status) {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    startTransition(async () => {
      const res = await moveJobApplicationStatus(id, status);
      if (res?.error) {
        toast(res.error, 'error');
        // rollback
        setApps(initial);
        return;
      }
      toast(`Status updated to ${status}`, 'success');
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    setMenuOpen(null);
    setApps((prev) => prev.filter((a) => a.id !== id));
    startTransition(async () => {
      const res = await deleteJobApplication(id);
      if (res?.error) {
        toast(res.error, 'error');
        // rollback
        setApps(initial);
        return;
      }
      toast('Application removed', 'success');
      router.refresh();
    });
  }

  return (
    <div className="grid grid-flow-col auto-cols-[88%] sm:auto-cols-[60%] lg:grid-cols-4 lg:auto-cols-auto overflow-x-auto sm:overflow-visible gap-4 pb-4 scroll-thin snap-x snap-mandatory sm:snap-none">
      {COLS.map((col) => {
        const items = apps.filter((a) => a.status === col.id);
        return (
          <div
            key={col.id}
            className={cn('kanban-col snap-start transition-shadow', dragOver === col.id && 'ring-2 ring-brand-400')}
            onDragOver={(e) => { e.preventDefault(); setDragOver(col.id); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => { setDragOver(null); if (dragId) move(dragId, col.id); }}
          >
            <div className="flex items-center justify-between px-2 py-1">
              <div className="flex items-center gap-2">
                <span className={cn('w-2 h-2 rounded-full', col.stripe)} />
                <h3 className="font-semibold text-ink-900">{col.label}</h3>
                <span className="text-xs text-ink-500">({items.length})</span>
                {pending && <Loader2 className="w-3 h-3 animate-spin text-ink-400" />}
              </div>
            </div>
            <div className="space-y-2.5 min-h-[60px]">
              <AnimatePresence>
                {items.map((a) => {
                  const job = jobs.find((j) => j.id === a.jobId);
                  return (
                    <motion.article
                      key={a.id} layout
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      draggable
                      onDragStart={() => setDragId(a.id)}
                      onDragEnd={() => setDragId(null)}
                      className={cn('kanban-card', dragId === a.id && 'opacity-40')}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-ink-900 text-sm leading-snug truncate">{job?.title ?? 'Job'}</p>
                          <p className="text-xs text-ink-500 mt-0.5">{job?.company} {job?.city ? `· ${job.city}` : ''}</p>
                        </div>
                        <div className="relative">
                          <button onClick={() => setMenuOpen(menuOpen === a.id ? null : a.id)} className="p-1 -m-1 rounded hover:bg-ink-100 text-ink-400"><MoreHorizontal className="w-4 h-4" /></button>
                          {menuOpen === a.id && (
                            <div className="absolute top-8 right-0 z-10 bg-white border border-ink-200 rounded-lg shadow-lg">
                              <button onClick={() => handleDelete(a.id)} className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 whitespace-nowrap">
                                <Trash2 className="w-3.5 h-3.5" />
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-ink-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Applied {formatDate(a.appliedAt)}</span>
                      </div>
                      {a.followUp && (
                        <p className="mt-1 text-xs text-amber-700 font-medium flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Follow up {formatDate(a.followUp)}
                        </p>
                      )}
                      {a.notes && <p className="mt-3 text-xs text-ink-600 line-clamp-2">{a.notes}</p>}
                      <div className="mt-3 pt-3 border-t border-ink-100 flex items-center justify-between text-xs">
                        <span className={cn(col.tone, 'capitalize')}>{a.status}</span>
                        <span className="text-ink-500 truncate ml-2">{a.resumeSnapshotName}</span>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
              {items.length === 0 && (
                <div className="border-2 border-dashed border-ink-200 rounded-xl p-6 text-center">
                  <p className="text-xs text-ink-400">Drop cards here</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
