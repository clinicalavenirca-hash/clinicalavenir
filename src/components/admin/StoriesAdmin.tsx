'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Quote as QuoteIcon, Save, Loader2 } from 'lucide-react';
import type { Story } from '@/lib/data';
import { Avatar } from '@/components/ui/Avatar';
import { ImageUploadField } from '@/components/ui/ImageUploadField';
import { toast } from '@/components/ui/Toast';
import { createStory, deleteStory } from '@/app/actions/stories';

type Draft = { name: string; placement: string; quote: string; avatar: string | null };
const emptyDraft: Draft = { name: '', placement: '', quote: '', avatar: null };

export function StoriesAdmin({ initial }: { initial: Story[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [pending, startTransition] = useTransition();

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim() || !draft.placement.trim() || !draft.quote.trim()) {
      toast('Name, placement, and quote are required.', 'warning');
      return;
    }
    startTransition(async () => {
      const res = await createStory(draft);
      if (res?.error) { toast(res.error, 'error'); return; }
      setDraft(emptyDraft);
      toast('Story added.', 'success');
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!confirm('Delete this story? It will disappear from the home page.')) return;
    startTransition(async () => {
      const res = await deleteStory(id);
      if (res?.error) { toast(res.error, 'error'); return; }
      toast('Story deleted.', 'info');
      router.refresh();
    });
  }

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <form onSubmit={save} className="lg:col-span-5 card card-pad space-y-5 self-start lg:sticky lg:top-6">
        <h3 className="text-lg font-display font-semibold flex items-center gap-2"><Plus className="w-5 h-5 text-brand-600" /> Add a story</h3>
        <ImageUploadField
          bucket="story-avatars"
          folder="public"
          value={draft.avatar}
          onChange={(url) => setDraft((d) => ({ ...d, avatar: url }))}
          label="Photo (optional)"
          aspect="square"
          hint="A square crop works best. We'll fall back to initials if no photo is set."
        />
        <div>
          <label className="label">Name *</label>
          <input className="input" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Anjali R." />
        </div>
        <div>
          <label className="label">Placement *</label>
          <input className="input" value={draft.placement} onChange={(e) => setDraft((d) => ({ ...d, placement: e.target.value }))} placeholder="CRA I — Veristat, Toronto" />
        </div>
        <div>
          <label className="label">Quote *</label>
          <textarea rows={4} className="input resize-none" value={draft.quote} onChange={(e) => setDraft((d) => ({ ...d, quote: e.target.value }))} placeholder="What this graduate took away from the program." />
        </div>
        <div className="flex justify-end pt-2 border-t border-ink-100">
          <button type="submit" disabled={pending} className="btn-primary btn-md">
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {pending ? 'Saving…' : 'Save story'}
          </button>
        </div>
      </form>

      <div className="lg:col-span-7 space-y-3">
        <p className="text-sm text-ink-500 px-1">{initial.length} stor{initial.length === 1 ? 'y' : 'ies'} on the home page</p>
        <AnimatePresence>
          {initial.map((s) => (
            <motion.article key={s.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="card card-pad relative">
              <QuoteIcon className="absolute top-4 right-4 w-6 h-6 text-brand-100" fill="currentColor" />
              <div className="flex items-start gap-3 pr-8">
                <Avatar name={s.name} src={s.avatar} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink-900">{s.name}</p>
                  <p className="text-xs text-ink-500">{s.placement}</p>
                </div>
              </div>
              <blockquote className="mt-3 text-sm text-ink-700 leading-relaxed">&ldquo;{s.quote}&rdquo;</blockquote>
              <div className="mt-4 pt-4 border-t border-ink-100 flex items-center justify-end gap-2">
                <button onClick={() => remove(s.id)} disabled={pending} className="btn-ghost btn-sm text-rose-600 hover:bg-rose-50">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
        {initial.length === 0 && (
          <div className="card card-pad text-center py-12">
            <p className="text-sm text-ink-500">No stories yet. Add your first one on the left.</p>
          </div>
        )}
      </div>
    </div>
  );
}
