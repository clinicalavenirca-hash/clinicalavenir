'use client';
import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronDown, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { setContactMessageStatus, deleteContactMessage } from '@/app/actions/contactMessages';
import { cn, formatDate, initials } from '@/lib/utils';

export type ContactMessage = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  topic: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
};

const STATUS_TONES: Record<ContactMessage['status'], string> = {
  new: 'bg-accent-100 text-accent-700 ring-accent-200',
  read: 'bg-ink-100 text-ink-700 ring-ink-200',
  replied: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  archived: 'bg-brand-100 text-brand-700 ring-brand-200'
};
const STATUS_ORDER: ContactMessage['status'][] = ['new', 'read', 'replied', 'archived'];

/**
 * Admin messages inbox. Click a row to expand the full message and reveal
 * status-change pills + a delete button. Status changes optimistically update
 * the local list, then call the server action to persist.
 */
export function MessagesInbox({ initial }: { initial: ContactMessage[] }) {
  const [messages, setMessages] = useState(initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ContactMessage['status'] | 'all'>('all');
  const [pending, startTransition] = useTransition();

  const filtered = filter === 'all' ? messages : messages.filter((m) => m.status === filter);

  function changeStatus(id: string, status: ContactMessage['status']) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    startTransition(async () => {
      const res = await setContactMessageStatus(id, status);
      if (res?.error) toast(res.error, 'error');
    });
  }

  function remove(id: string) {
    if (!confirm('Delete this message? This cannot be undone.')) return;
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (openId === id) setOpenId(null);
    startTransition(async () => {
      const res = await deleteContactMessage(id);
      if (res?.error) toast(res.error, 'error');
      else toast('Message deleted.', 'info');
    });
  }

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'new', 'read', 'replied', 'archived'] as const).map((f) => {
          const count = f === 'all' ? messages.length : messages.filter((m) => m.status === f).length;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors capitalize',
                filter === f
                  ? 'bg-ink-950 text-white'
                  : 'bg-white text-ink-700 ring-1 ring-inset ring-ink-200 hover:ring-ink-400'
              )}
            >
              {f} <span className="ml-1 opacity-70 tabular-nums">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="card card-pad text-center py-16">
          <p className="text-sm text-ink-500">
            {filter === 'all' ? 'No messages yet.' : `No ${filter} messages.`}
          </p>
        </div>
      )}

      {/* Message list */}
      <ul className="space-y-3">
        {filtered.map((m) => {
          const open = openId === m.id;
          return (
            <li key={m.id} className="card overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : m.id)}
                className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-brand-50/40 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white grid place-items-center text-xs font-semibold flex-shrink-0">
                    {initials(m.fullName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink-950 text-sm truncate">{m.fullName}</p>
                      <span className="text-xs text-ink-500 truncate">{m.email}</span>
                    </div>
                    <p className="mt-1 text-sm text-ink-700 line-clamp-1">{m.message}</p>
                    <p className="mt-1 text-xs text-ink-500">
                      {m.topic ? `${m.topic} · ` : ''}
                      {formatDate(m.createdAt, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={cn('badge ring-1 ring-inset capitalize', STATUS_TONES[m.status])}>
                    {m.status}
                  </span>
                  <ChevronDown
                    className={cn('w-4 h-4 text-ink-400 transition-transform', open && 'rotate-180')}
                    strokeWidth={2.2}
                  />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden border-t border-ink-100 bg-brand-50/40"
                  >
                    <div className="p-4 sm:p-5 space-y-4">
                      {/* Contact details strip */}
                      <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                        <div>
                          <dt className="text-ink-500 uppercase tracking-[0.18em] font-semibold text-[10px]">Email</dt>
                          <dd className="mt-0.5 text-ink-950">
                            <a href={`mailto:${m.email}`} className="hover:text-accent-600">{m.email}</a>
                          </dd>
                        </div>
                        {m.phone && (
                          <div>
                            <dt className="text-ink-500 uppercase tracking-[0.18em] font-semibold text-[10px]">Phone</dt>
                            <dd className="mt-0.5 text-ink-950">
                              {m.countryCode} {m.phone}
                            </dd>
                          </div>
                        )}
                        {m.topic && (
                          <div>
                            <dt className="text-ink-500 uppercase tracking-[0.18em] font-semibold text-[10px]">Topic</dt>
                            <dd className="mt-0.5 text-ink-950">{m.topic}</dd>
                          </div>
                        )}
                      </dl>

                      {/* Full message body */}
                      <div className="rounded-xl bg-white ring-1 ring-ink-100 p-4">
                        <p className="text-sm text-ink-800 leading-relaxed whitespace-pre-wrap">{m.message}</p>
                      </div>

                      {/* Action row — status pills + delete */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          {STATUS_ORDER.map((s) => (
                            <button
                              key={s}
                              type="button"
                              disabled={pending || m.status === s}
                              onClick={() => changeStatus(m.id, s)}
                              className={cn(
                                'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors capitalize',
                                m.status === s
                                  ? 'bg-ink-950 text-white cursor-default'
                                  : 'bg-white text-ink-700 ring-1 ring-inset ring-ink-200 hover:ring-ink-950 hover:text-ink-950'
                              )}
                            >
                              Mark as {s}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(m.id)}
                          disabled={pending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                        >
                          {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" strokeWidth={2.2} />}
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
