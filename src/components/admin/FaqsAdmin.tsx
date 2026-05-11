'use client';
import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, ChevronDown, Save, X, Loader2 } from 'lucide-react';
import type { FaqRow } from '@/lib/data';
import { toast } from '@/components/ui/Toast';
import { createFaq, updateFaq, deleteFaq, type FaqInput } from '@/app/actions/faqs';
import { cn } from '@/lib/utils';

type DraftKey = 'new' | string;

/**
 * Admin CRUD for FAQs. Click an existing FAQ to expand and edit inline. The
 * top "+ New" card opens a blank editor. Saves go through server actions
 * which revalidate the public surfaces (FAQ page, programs page, course
 * detail pages) so changes appear immediately without a manual deploy.
 */
export function FaqsAdmin({ initial }: { initial: FaqRow[] }) {
  const [faqs, setFaqs] = useState<FaqRow[]>(initial);
  const [editing, setEditing] = useState<DraftKey | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function startEdit(id: DraftKey) {
    setEditing(id);
    if (id !== 'new') setOpenId(id);
  }
  function cancel() {
    setEditing(null);
  }

  function handleCreate(input: FaqInput) {
    startTransition(async () => {
      const res = await createFaq(input);
      if (res?.error) { toast(res.error, 'error'); return; }
      toast('FAQ created.', 'success');
      // Optimistically inject — fetched list will refresh on next nav.
      setFaqs((prev) => [
        ...prev,
        {
          id: `tmp-${Date.now()}`,
          question: input.question.trim(),
          answer: input.answer.trim(),
          category: input.category?.trim() || null,
          orderIndex: input.orderIndex
        }
      ].sort((a, b) => a.orderIndex - b.orderIndex));
      setEditing(null);
    });
  }

  function handleUpdate(id: string, input: FaqInput) {
    startTransition(async () => {
      const res = await updateFaq(id, input);
      if (res?.error) { toast(res.error, 'error'); return; }
      toast('FAQ updated.', 'success');
      setFaqs((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                question: input.question.trim(),
                answer: input.answer.trim(),
                category: input.category?.trim() || null,
                orderIndex: input.orderIndex
              }
            : f
        ).sort((a, b) => a.orderIndex - b.orderIndex)
      );
      setEditing(null);
    });
  }

  function handleDelete(id: string, question: string) {
    if (!confirm(`Delete "${question}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteFaq(id);
      if (res?.error) { toast(res.error, 'error'); return; }
      toast('FAQ deleted.', 'info');
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      if (openId === id) setOpenId(null);
      if (editing === id) setEditing(null);
    });
  }

  const nextOrderIndex = faqs.length === 0 ? 10 : Math.max(...faqs.map((f) => f.orderIndex)) + 10;

  return (
    <div className="space-y-4">
      {/* New FAQ */}
      {editing === 'new' ? (
        <FaqEditor
          defaults={{ question: '', answer: '', category: '', orderIndex: nextOrderIndex }}
          onSave={(input) => handleCreate(input)}
          onCancel={cancel}
          pending={pending}
          isNew
        />
      ) : (
        <button
          type="button"
          onClick={() => startEdit('new')}
          className="card card-pad card-hover w-full text-left flex items-center gap-3 hover:border-ink-950"
        >
          <span className="inline-flex w-10 h-10 rounded-xl bg-ink-950 text-white items-center justify-center flex-shrink-0">
            <Plus className="w-5 h-5" strokeWidth={2.2} />
          </span>
          <span className="font-semibold text-ink-950">New FAQ</span>
          <span className="text-sm text-ink-500">Question + answer, optional category and order</span>
        </button>
      )}

      {/* Existing FAQs */}
      {faqs.length === 0 ? (
        <div className="card card-pad text-center py-12">
          <p className="text-sm text-ink-500">No FAQs yet — add the first one above.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {faqs.map((f) => {
            const isOpen = openId === f.id;
            const isEditing = editing === f.id;
            return (
              <li key={f.id} className="card overflow-hidden">
                {isEditing ? (
                  <FaqEditor
                    defaults={{
                      question: f.question,
                      answer: f.answer,
                      category: f.category ?? '',
                      orderIndex: f.orderIndex
                    }}
                    onSave={(input) => handleUpdate(f.id, input)}
                    onCancel={cancel}
                    onDelete={() => handleDelete(f.id, f.question)}
                    pending={pending}
                  />
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : f.id)}
                      className="w-full p-4 sm:p-5 flex items-start justify-between gap-4 text-left hover:bg-brand-50/40 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-ink-500 tabular-nums">
                            {String(f.orderIndex).padStart(3, '0')}
                          </span>
                          {f.category && <span className="badge-brand text-[10px]">{f.category}</span>}
                        </div>
                        <p className="mt-1 font-semibold text-ink-950 text-sm sm:text-base">{f.question}</p>
                        {!isOpen && <p className="mt-1 text-xs text-ink-500 line-clamp-1">{f.answer}</p>}
                      </div>
                      <ChevronDown
                        className={cn('w-4 h-4 text-ink-400 flex-shrink-0 mt-1 transition-transform', isOpen && 'rotate-180')}
                        strokeWidth={2.2}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden border-t border-ink-100"
                        >
                          <div className="p-4 sm:p-5 space-y-4">
                            <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">{f.answer}</p>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(f.id)}
                                className="btn-secondary btn-sm"
                              >
                                <Pencil className="w-3.5 h-3.5" strokeWidth={2.2} />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(f.id, f.question)}
                                disabled={pending}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" strokeWidth={2.2} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Inline editor used for both "new" and "edit existing". */
function FaqEditor({
  defaults,
  onSave,
  onCancel,
  onDelete,
  pending,
  isNew = false
}: {
  defaults: { question: string; answer: string; category: string; orderIndex: number };
  onSave: (input: FaqInput) => void;
  onCancel: () => void;
  onDelete?: () => void;
  pending: boolean;
  isNew?: boolean;
}) {
  const [question, setQuestion] = useState(defaults.question);
  const [answer, setAnswer] = useState(defaults.answer);
  const [category, setCategory] = useState(defaults.category);
  const [orderIndex, setOrderIndex] = useState<number | ''>(defaults.orderIndex);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast('Question and answer are required.', 'warning');
      return;
    }
    onSave({
      question,
      answer,
      category: category.trim() || null,
      orderIndex: typeof orderIndex === 'number' ? orderIndex : 100
    });
  }

  return (
    <form onSubmit={submit} className="card card-pad space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink-950">{isNew ? 'New FAQ' : 'Edit FAQ'}</p>
        <button type="button" onClick={onCancel} className="text-ink-500 hover:text-ink-950">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div>
        <label className="label">Question *</label>
        <input
          required
          className="input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Are sessions recorded?"
        />
      </div>

      <div>
        <label className="label">Answer *</label>
        <textarea
          required
          rows={5}
          className="input resize-none"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Plain text — line breaks are preserved in the public accordion."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Category <span className="text-ink-400 font-normal">(optional)</span></label>
          <input
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Sessions / Payments / Career …"
          />
        </div>
        <div>
          <label className="label">Order</label>
          <input
            type="number"
            min={0}
            step={10}
            className="input"
            value={orderIndex}
            onChange={(e) => setOrderIndex(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="10"
          />
          <p className="helper">Lower numbers appear first. Increments of 10 leave room to slot new entries between.</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button type="submit" disabled={pending} className="btn-primary btn-md">
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isNew ? 'Create FAQ' : 'Save changes'}
          </button>
          <button type="button" onClick={onCancel} className="btn-ghost btn-md">
            Cancel
          </button>
        </div>
        {onDelete && !isNew && (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={2.2} />
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
