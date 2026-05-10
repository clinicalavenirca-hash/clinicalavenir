'use client';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Check, Lock, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Course, Module } from '@/lib/data';
import { VideoPlayer } from './VideoPlayer';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { markVideoWatched, completeModule } from '@/app/actions/progress';

type Props = {
  course: Course;
  modules: Module[];
  watchedVideoIds: string[];
  completedModuleIds: string[];
};

export function CoursePlayer({ course, modules, watchedVideoIds, completedModuleIds }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const completedSet = new Set(completedModuleIds);
  const watchedSet = new Set(watchedVideoIds);

  const [active, setActive] = useState<{ moduleIdx: number; videoIdx: number }>({ moduleIdx: 0, videoIdx: 0 });
  const [openIdx, setOpenIdx] = useState<number>(0);

  // First unlocked module = first incomplete one (or 0 if all complete)
  useEffect(() => {
    const firstIncomplete = modules.findIndex((m) => !completedSet.has(m.id));
    if (firstIncomplete >= 0) setOpenIdx(firstIncomplete);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function isLocked(i: number) {
    if (i === 0) return false;
    const prev = modules[i - 1];
    return !completedSet.has(prev.id);
  }

  const currentVideo = modules[active.moduleIdx]?.videos[active.videoIdx];

  function loadVideo(mi: number, vi: number) {
    if (isLocked(mi)) return;
    setActive({ moduleIdx: mi, videoIdx: vi });
    const v = modules[mi].videos[vi];
    if (!v) return;
    if (!watchedSet.has(v.id)) {
      startTransition(async () => {
        await markVideoWatched(v.id);
        router.refresh();
      });
    }
    toast(`Now playing: ${v.title}`, 'info');
  }

  function markModuleComplete(mi: number) {
    const m = modules[mi];
    if (!m) return;
    startTransition(async () => {
      const res = await completeModule(m.id);
      if (res?.error) { toast(res.error, 'error'); return; }
      toast('Module complete — next module unlocked.', 'success');
      router.refresh();
    });
  }

  if (modules.length === 0) {
    return (
      <div className="card card-pad text-center py-12">
        <p className="text-ink-500 text-sm">This course has no modules published yet. Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 space-y-5">
        <div className="card overflow-hidden">
          {currentVideo
            ? <VideoPlayer videoId={currentVideo.youtube} title={currentVideo.title} />
            : <div className="aspect-video bg-ink-900 grid place-items-center text-white/60 text-sm">No videos in this module yet.</div>
          }
        </div>
        <div className="card card-pad">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs font-semibold text-brand-700 uppercase tracking-wider">{course.tagline}</p>
              <h1 className="mt-1 text-2xl">{course.title}</h1>
              <p className="mt-2 text-ink-600">{course.shortDescription}</p>
            </div>
            <div className="flex flex-col items-end gap-1 text-right">
              <span className="badge-brand">{course.duration}</span>
              <span className="text-xs text-ink-500">{course.timings}</span>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-ink-50"><p className="text-xs text-ink-500">Modules</p><p className="font-semibold mt-0.5">{modules.length}</p></div>
            <div className="p-3 rounded-xl bg-ink-50"><p className="text-xs text-ink-500">Lessons</p><p className="font-semibold mt-0.5">{modules.reduce((a, m) => a + m.videos.length, 0)}</p></div>
            <div className="p-3 rounded-xl bg-ink-50"><p className="text-xs text-ink-500">Schedule</p><p className="font-semibold mt-0.5">{course.timings || '—'}</p></div>
            <div className="p-3 rounded-xl bg-ink-50"><p className="text-xs text-ink-500">Certificate</p><p className="font-semibold mt-0.5">{course.certificate ? 'Yes' : 'No'}</p></div>
          </div>
        </div>
      </div>

      <aside className="lg:col-span-4 space-y-3 lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto scroll-thin lg:pr-1">
        <div className="card card-pad">
          <p className="eyebrow">Curriculum</p>
          <p className="mt-1 text-sm text-ink-600">Modules unlock as you complete the previous one.</p>
        </div>
        {modules.map((m, i) => {
          const locked = isLocked(i);
          const completed = completedSet.has(m.id);
          const isOpen = openIdx === i;
          const allWatched = m.videos.length > 0 && m.videos.every((v) => watchedSet.has(v.id));
          return (
            <div key={m.id} className={cn('card overflow-hidden', locked && 'opacity-60')}>
              <button onClick={() => !locked && setOpenIdx(isOpen ? -1 : i)} disabled={locked} className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left disabled:cursor-not-allowed">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={cn('w-9 h-9 flex-shrink-0 rounded-xl grid place-items-center font-bold text-sm', completed ? 'bg-emerald-50 text-emerald-700' : locked ? 'bg-ink-100 text-ink-400' : 'bg-brand-50 text-brand-700')}>
                    {completed ? <Check className="w-4 h-4" strokeWidth={3} /> : locked ? <Lock className="w-4 h-4" /> : i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">{m.week || `Module ${i + 1}`}</p>
                    <p className="font-semibold text-ink-900 text-sm truncate">{m.title}</p>
                  </div>
                </div>
                {!locked && <ChevronDown className={cn('w-4 h-4 text-ink-400 transition-transform flex-shrink-0', isOpen && 'rotate-180')} />}
              </button>
              <AnimatePresence initial={false}>
                {!locked && isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden border-t border-ink-100">
                    {m.videos.map((v, vi) => {
                      const w = watchedSet.has(v.id);
                      const isPlaying = active.moduleIdx === i && active.videoIdx === vi;
                      return (
                        <button key={v.id} onClick={() => loadVideo(i, vi)} className={cn('w-full px-4 py-2.5 flex items-center gap-3 text-sm text-left hover:bg-ink-50 transition-colors', isPlaying && 'bg-brand-50/60')}>
                          <span className={cn('w-6 h-6 rounded-full grid place-items-center flex-shrink-0', w ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-500')}>
                            {w ? <Check className="w-3 h-3" strokeWidth={3} /> : <Play className="w-3 h-3" fill="currentColor" />}
                          </span>
                          <span className={cn('flex-1 truncate', w ? 'text-ink-500' : 'text-ink-800')}>{v.title}</span>
                          <span className="text-xs text-ink-400 tabular-nums flex-shrink-0">{v.duration}</span>
                        </button>
                      );
                    })}
                    {m.videos.length === 0 && <p className="px-4 py-3 text-xs text-ink-500">No lessons yet.</p>}
                    {!completed && m.videos.length > 0 && (
                      <div className="px-4 py-3 bg-ink-50 border-t border-ink-100">
                        <button onClick={() => markModuleComplete(i)} disabled={!allWatched || pending} className="btn-primary btn-sm w-full justify-center disabled:opacity-50">
                          {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                          {allWatched ? 'Mark module complete' : 'Watch all lessons to complete'}
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              {locked && (
                <div className="px-4 py-3 bg-ink-50 border-t border-ink-100">
                  <p className="text-xs text-ink-500 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Complete the previous module to unlock</p>
                </div>
              )}
            </div>
          );
        })}
      </aside>
    </div>
  );
}
