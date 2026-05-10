'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Trash2, Plus, Loader2, Save, Pencil, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Module } from '@/lib/data';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import {
  createModule, updateModule, deleteModule,
  createVideo, deleteVideo, reorderVideo
} from '@/app/actions/modules';

type Props = { courseId: string; modules: Module[] };

/** Inline list editor: one row per point with add / remove. Same UX as the
 *  "What you'll learn" input on the course form so admins enter topics one
 *  at a time instead of as a single comma-separated string. */
function PointsEditor({
  value,
  onChange,
  placeholder
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      {value.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 grid place-items-center text-xs font-semibold flex-shrink-0">{i + 1}</span>
          <input
            className="input"
            value={p}
            onChange={(e) => onChange(value.map((x, idx) => (idx === i ? e.target.value : x)))}
            placeholder={placeholder ?? 'Topic point'}
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            className="p-2 rounded-lg hover:bg-rose-50 text-ink-400 hover:text-rose-600"
            aria-label="Remove point"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, ''])}
        className="btn-ghost btn-sm text-brand-700 hover:bg-brand-50"
      >
        <Plus className="w-4 h-4" /> Add point
      </button>
    </div>
  );
}

export function ModuleManager({ courseId, modules }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(modules[0]?.id ?? null);
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<string | null>(null);

  // New module draft — topics is now an array of strings, one per point.
  const [newModule, setNewModule] = useState<{ title: string; description: string; weekLabel: string; topics: string[] }>({
    title: '', description: '', weekLabel: '', topics: []
  });

  function addModule(e: React.FormEvent) {
    e.preventDefault();
    if (!newModule.title.trim()) { toast('Title is required.', 'warning'); return; }
    const topics = newModule.topics.map((t) => t.trim()).filter(Boolean);
    startTransition(async () => {
      const res = await createModule({
        courseId,
        title: newModule.title,
        description: newModule.description,
        weekLabel: newModule.weekLabel,
        topics
      });
      if (res?.error) { toast(res.error, 'error'); return; }
      setNewModule({ title: '', description: '', weekLabel: '', topics: [] });
      toast('Module created.', 'success');
      router.refresh();
    });
  }

  function removeModule(id: string, title: string) {
    if (!confirm(`Delete module "${title}" and all its videos?`)) return;
    startTransition(async () => {
      const res = await deleteModule(id, courseId);
      if (res?.error) { toast(res.error, 'error'); return; }
      toast('Module deleted.', 'info');
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {modules.map((m, i) => {
        const isOpen = open === m.id;
        return (
          <article key={m.id} className="card overflow-hidden">
            <div className="px-5 py-4 flex items-start sm:items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center font-bold flex-shrink-0">{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-xs text-ink-500 font-semibold uppercase tracking-wider">{m.week || `Module ${i + 1}`}</p>
                  <p className="font-semibold text-ink-900 truncate">{m.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="badge-ink">{m.videos.length} videos</span>
                <button onClick={() => setEditing(editing === m.id ? null : m.id)} className="btn-ghost btn-sm">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => removeModule(m.id, m.title)} disabled={pending} className="btn-ghost btn-sm text-rose-600 hover:bg-rose-50">
                  {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Delete
                </button>
                <button onClick={() => setOpen(isOpen ? null : m.id)} className="p-2 rounded-lg hover:bg-ink-100">
                  <ChevronDown className={cn('w-5 h-5 text-ink-500 transition-transform', isOpen && 'rotate-180')} />
                </button>
              </div>
            </div>

            {editing === m.id && (
              <ModuleEditInline
                module={m}
                courseId={courseId}
                onClose={() => setEditing(null)}
              />
            )}

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden border-t border-ink-100">
                  <div className="px-5 py-4 grid sm:grid-cols-2 gap-4 bg-ink-50/40">
                    <div>
                      <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Description</p>
                      <p className="text-sm text-ink-700 leading-relaxed">{m.description || <em className="text-ink-400">No description yet.</em>}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Topics covered</p>
                      <div className="flex flex-wrap gap-1.5">
                        {m.topics.length > 0 ? m.topics.map((t) => <span key={t} className="badge-brand">{t}</span>) : <em className="text-ink-400 text-sm">No topics yet.</em>}
                      </div>
                    </div>
                  </div>

                  <VideoList moduleId={m.id} videos={m.videos} courseId={courseId} />
                </motion.div>
              )}
            </AnimatePresence>
          </article>
        );
      })}

      {/* New module form */}
      <form onSubmit={addModule} className="card p-5 space-y-3">
        <h3 className="font-display font-semibold flex items-center gap-2"><Plus className="w-5 h-5 text-brand-600" /> Add a module</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="input" placeholder="Title (e.g. ICH-GCP foundations)" value={newModule.title} onChange={(e) => setNewModule((n) => ({ ...n, title: e.target.value }))} />
          <input className="input" placeholder="Week label (e.g. Week 1)" value={newModule.weekLabel} onChange={(e) => setNewModule((n) => ({ ...n, weekLabel: e.target.value }))} />
        </div>
        <textarea rows={2} className="input resize-none" placeholder="Description" value={newModule.description} onChange={(e) => setNewModule((n) => ({ ...n, description: e.target.value }))} />
        <div>
          <label className="label">Topics covered</label>
          <PointsEditor
            value={newModule.topics}
            onChange={(topics) => setNewModule((n) => ({ ...n, topics }))}
            placeholder="e.g. ICH-GCP E6(R3)"
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={pending} className="btn-primary btn-md">
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create module
          </button>
        </div>
      </form>
    </div>
  );
}

function ModuleEditInline({ module: m, courseId, onClose }: { module: Module; courseId: string; onClose: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState(m.title);
  const [description, setDescription] = useState(m.description);
  const [weekLabel, setWeekLabel] = useState(m.week);
  const [topics, setTopics] = useState<string[]>(m.topics ?? []);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const res = await updateModule(m.id, courseId, {
        title,
        description,
        weekLabel,
        topics: topics.map((t) => t.trim()).filter(Boolean)
      });
      if (res?.error) { toast(res.error, 'error'); return; }
      toast('Module updated.', 'success');
      onClose();
      router.refresh();
    });
  }

  return (
    <div className="px-5 py-4 border-t border-ink-100 bg-brand-50/30 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="input" placeholder="Week label" value={weekLabel} onChange={(e) => setWeekLabel(e.target.value)} />
      </div>
      <textarea rows={2} className="input resize-none" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div>
        <label className="label">Topics covered</label>
        <PointsEditor value={topics} onChange={setTopics} placeholder="e.g. ICH-GCP E6(R3)" />
      </div>
      <div className="flex items-center justify-end gap-2">
        <button onClick={onClose} className="btn-ghost btn-sm">Cancel</button>
        <button onClick={save} disabled={pending} className="btn-primary btn-sm">
          {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save
        </button>
      </div>
    </div>
  );
}

function VideoList({ moduleId, videos, courseId }: { moduleId: string; videos: Module['videos']; courseId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState({ title: '', youtube: '', durationLabel: '' });

  function addVideo() {
    if (!draft.title.trim() || !draft.youtube.trim()) { toast('Title and YouTube link are required.', 'warning'); return; }
    startTransition(async () => {
      const res = await createVideo({ moduleId, title: draft.title, youtube: draft.youtube, durationLabel: draft.durationLabel }, courseId);
      if (res?.error) { toast(res.error, 'error'); return; }
      setDraft({ title: '', youtube: '', durationLabel: '' });
      toast('Lesson added.', 'success');
      router.refresh();
    });
  }

  function remove(id: string, title: string) {
    if (!confirm(`Delete lesson "${title}"?`)) return;
    startTransition(async () => {
      const res = await deleteVideo(id, courseId);
      if (res?.error) { toast(res.error, 'error'); return; }
      toast('Lesson deleted.', 'info');
      router.refresh();
    });
  }

  function move(id: string, direction: 'up' | 'down') {
    startTransition(async () => {
      await reorderVideo(id, courseId, direction);
      router.refresh();
    });
  }

  return (
    <div className="px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-ink-900">Lessons ({videos.length})</p>
      </div>
      <ul className="space-y-2">
        {videos.map((v, vi) => (
          <li key={v.id} className="flex items-center gap-3 p-3 rounded-xl border border-ink-100 hover:border-ink-200 transition-colors">
            <div className="flex flex-col gap-0.5 text-ink-300">
              <button disabled={vi === 0 || pending} onClick={() => move(v.id, 'up')} className="hover:text-ink-700 disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
              <button disabled={vi === videos.length - 1 || pending} onClick={() => move(v.id, 'down')} className="hover:text-ink-700 disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
            </div>
            <span className="w-7 h-7 rounded-lg bg-ink-100 grid place-items-center text-xs font-semibold text-ink-600 flex-shrink-0">{vi + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-ink-900 truncate">{v.title}</p>
              <p className="text-xs text-ink-500">YouTube · {v.youtube} {v.duration && `· ${v.duration}`}</p>
            </div>
            <button onClick={() => remove(v.id, v.title)} disabled={pending} className="p-1.5 rounded text-ink-400 hover:text-rose-600 hover:bg-rose-50">
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 p-4 rounded-xl bg-brand-50/40 border border-brand-100">
        <p className="text-sm font-semibold text-ink-900 mb-3">Quick add lesson</p>
        <div className="grid sm:grid-cols-4 gap-2">
          <input className="input !py-2 !text-sm sm:col-span-2" placeholder="Lesson title" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
          <input className="input !py-2 !text-sm" placeholder="YouTube URL or 11-char ID" value={draft.youtube} onChange={(e) => setDraft((d) => ({ ...d, youtube: e.target.value }))} />
          <input className="input !py-2 !text-sm" placeholder="Duration (e.g. 12:08)" value={draft.durationLabel} onChange={(e) => setDraft((d) => ({ ...d, durationLabel: e.target.value }))} />
        </div>
        <div className="mt-3 flex justify-end">
          <button onClick={addVideo} disabled={pending} className="btn-primary btn-sm">
            {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Add lesson
          </button>
        </div>
      </div>
    </div>
  );
}
