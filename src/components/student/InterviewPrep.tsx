'use client';
import { useState, useTransition, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Bookmark, BookmarkCheck, Pencil, Save, X, Loader2 } from 'lucide-react';
import type {
  Course,
  InterviewTopic,
  InterviewQuestionRow,
  InterviewBookmark
} from '@/lib/data';
import { toast } from '@/components/ui/Toast';
import { toggleBookmark, updateBookmarkNote } from '@/app/actions/interview';
import { cn } from '@/lib/utils';

const DIFFICULTY_TONES: Record<InterviewQuestionRow['difficulty'], string> = {
  beginner: 'badge-success',
  intermediate: 'badge-warning',
  advanced: 'badge-accent'
};

type CourseScope = 'enrolled' | 'all' | string;

/**
 * Student interview prep. Three filter axes: course scope (your tracks /
 * all tracks / a specific track), topic pill, and search. "My notes" tab
 * narrows to bookmarked questions and reveals an editable note per row.
 * Bookmarks toggle optimistically; the server action persists + the
 * <InterviewRealtime /> companion refreshes the page if admin edits a
 * question while you're reading.
 */
export function InterviewPrep({
  courses,
  topics,
  questions,
  bookmarks,
  enrolledSlugs
}: {
  courses: Course[];
  topics: InterviewTopic[];
  questions: InterviewQuestionRow[];
  bookmarks: InterviewBookmark[];
  enrolledSlugs: string[];
}) {
  const [tab, setTab] = useState<'browse' | 'notes'>('browse');
  const [courseScope, setCourseScope] = useState<CourseScope>('enrolled');
  const [activeTopic, setActiveTopic] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [editingNoteFor, setEditingNoteFor] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Local optimistic bookmark map: questionId → { bookmarked, note }
  const [bmMap, setBmMap] = useState<Map<string, { bookmarked: boolean; note: string | null }>>(
    () => new Map(bookmarks.map((b) => [b.questionId, { bookmarked: true, note: b.note }]))
  );

  // Sync local state when the server re-fetches (e.g. after realtime refresh)
  useEffect(() => {
    setBmMap(new Map(bookmarks.map((b) => [b.questionId, { bookmarked: true, note: b.note }])));
  }, [bookmarks]);

  const enrolledCourseIds = useMemo(
    () => new Set(courses.filter((c) => enrolledSlugs.includes(c.slug)).map((c) => c.id)),
    [courses, enrolledSlugs]
  );

  // Topics visible given the chosen course scope
  const visibleTopics = useMemo(() => {
    if (courseScope === 'all') return topics;
    if (courseScope === 'enrolled') return topics.filter((t) => enrolledCourseIds.has(t.courseId));
    return topics.filter((t) => t.courseId === courseScope);
  }, [topics, courseScope, enrolledCourseIds]);

  const visibleTopicIds = useMemo(() => new Set(visibleTopics.map((t) => t.id)), [visibleTopics]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (!visibleTopicIds.has(q.topicId)) return false;
      if (activeTopic !== 'all' && q.topicId !== activeTopic) return false;
      if (tab === 'notes' && !(bmMap.get(q.id)?.bookmarked ?? false)) return false;
      if (search.trim()) {
        const s = search.toLowerCase();
        if (!q.question.toLowerCase().includes(s) && !q.answer.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [questions, visibleTopicIds, activeTopic, tab, bmMap, search]);

  function topicLabel(topicId: string): string {
    return topics.find((t) => t.id === topicId)?.label ?? 'Unknown topic';
  }

  function handleToggleBookmark(questionId: string) {
    // Optimistic flip
    const current = bmMap.get(questionId)?.bookmarked ?? false;
    const nextMap = new Map(bmMap);
    nextMap.set(questionId, {
      bookmarked: !current,
      note: nextMap.get(questionId)?.note ?? null
    });
    setBmMap(nextMap);

    startTransition(async () => {
      const res = await toggleBookmark(questionId);
      if (res?.error) {
        // Roll back on error
        const rollback = new Map(bmMap);
        rollback.set(questionId, { bookmarked: current, note: rollback.get(questionId)?.note ?? null });
        setBmMap(rollback);
        toast(res.error, 'error');
        return;
      }
      toast(current ? 'Removed from notes.' : 'Saved to notes.', current ? 'info' : 'success');
    });
  }

  function handleSaveNote(questionId: string, note: string) {
    startTransition(async () => {
      const res = await updateBookmarkNote(questionId, note);
      if (res?.error) { toast(res.error, 'error'); return; }
      const next = new Map(bmMap);
      next.set(questionId, { bookmarked: true, note: note.trim() || null });
      setBmMap(next);
      setEditingNoteFor(null);
      toast('Note saved.', 'success');
    });
  }

  const enrolledCount = courses.filter((c) => enrolledSlugs.includes(c.slug)).length;
  const bookmarkCount = Array.from(bmMap.values()).filter((b) => b.bookmarked).length;

  return (
    <>
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-5">
        <button
          type="button"
          onClick={() => setTab('browse')}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-semibold transition-colors',
            tab === 'browse' ? 'bg-ink-950 text-white' : 'bg-white text-ink-700 ring-1 ring-inset ring-ink-200 hover:ring-ink-400'
          )}
        >
          Browse
        </button>
        <button
          type="button"
          onClick={() => setTab('notes')}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-semibold transition-colors inline-flex items-center gap-2',
            tab === 'notes' ? 'bg-ink-950 text-white' : 'bg-white text-ink-700 ring-1 ring-inset ring-ink-200 hover:ring-ink-400'
          )}
        >
          <BookmarkCheck className="w-3.5 h-3.5" strokeWidth={2.4} />
          My notes
          <span className="opacity-70 tabular-nums">{bookmarkCount}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card card-pad mb-5 space-y-4">
        {/* Course scope */}
        <div>
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-ink-500 mb-2">Course</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setCourseScope('enrolled'); setActiveTopic('all'); }}
              disabled={enrolledCount === 0}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors disabled:opacity-50',
                courseScope === 'enrolled'
                  ? 'bg-ink-950 text-white'
                  : 'bg-white text-ink-700 ring-1 ring-inset ring-ink-200 hover:ring-ink-400'
              )}
            >
              My tracks <span className="opacity-70 tabular-nums">{enrolledCount}</span>
            </button>
            <button
              type="button"
              onClick={() => { setCourseScope('all'); setActiveTopic('all'); }}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
                courseScope === 'all'
                  ? 'bg-ink-950 text-white'
                  : 'bg-white text-ink-700 ring-1 ring-inset ring-ink-200 hover:ring-ink-400'
              )}
            >
              All tracks
            </button>
            {courses.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { setCourseScope(c.id); setActiveTopic('all'); }}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
                  courseScope === c.id
                    ? 'bg-ink-950 text-white'
                    : 'bg-white text-ink-700 ring-1 ring-inset ring-ink-200 hover:ring-ink-400'
                )}
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>

        {/* Topic pills */}
        {visibleTopics.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-ink-500 mb-2">Topic</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTopic('all')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
                  activeTopic === 'all'
                    ? 'bg-accent-500 text-white'
                    : 'bg-white text-ink-700 ring-1 ring-inset ring-ink-200 hover:ring-ink-400'
                )}
              >
                All topics
              </button>
              {visibleTopics.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTopic(t.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
                    activeTopic === t.id
                      ? 'bg-accent-500 text-white'
                      : 'bg-white text-ink-700 ring-1 ring-inset ring-ink-200 hover:ring-ink-400'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" strokeWidth={2} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions and answers…"
            className="input pl-9"
          />
        </div>
      </div>

      {/* Question list */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="card card-pad text-center py-16">
            <p className="text-sm text-ink-500">
              {tab === 'notes'
                ? 'No saved notes yet — tap the bookmark icon on any question to save it here.'
                : 'No questions match these filters. Try widening the scope.'}
            </p>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isOpen = openId === q.id;
            const bm = bmMap.get(q.id);
            const isBookmarked = bm?.bookmarked ?? false;
            const isEditingNote = editingNoteFor === q.id;
            return (
              <div key={q.id} className="card overflow-hidden">
                <div className="flex items-start gap-3 px-4 sm:px-5 pt-4 sm:pt-5">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : q.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="badge-brand">{topicLabel(q.topicId)}</span>
                      <span className={cn(DIFFICULTY_TONES[q.difficulty], 'capitalize text-[10px]')}>
                        {q.difficulty}
                      </span>
                    </div>
                    <p className="font-semibold text-ink-950 text-base leading-snug">{q.question}</p>
                  </button>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(q.id)}
                      disabled={pending}
                      className={cn(
                        'p-1.5 rounded-md transition-colors',
                        isBookmarked ? 'text-accent-600 hover:bg-accent-50' : 'text-ink-400 hover:text-ink-950 hover:bg-ink-100'
                      )}
                      aria-label={isBookmarked ? 'Remove from notes' : 'Save to notes'}
                    >
                      {isBookmarked
                        ? <BookmarkCheck className="w-4 h-4" strokeWidth={2.4} />
                        : <Bookmark className="w-4 h-4" strokeWidth={2.2} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : q.id)}
                      className="p-1.5 rounded-md text-ink-400 hover:text-ink-950 hover:bg-ink-100"
                      aria-label={isOpen ? 'Collapse' : 'Expand'}
                    >
                      <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} strokeWidth={2.2} />
                    </button>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-5 pb-5 pt-3 border-t border-ink-100 mt-3 space-y-4">
                        <div>
                          <p className="eyebrow mb-2">Sample answer</p>
                          <p className="text-ink-700 leading-relaxed whitespace-pre-wrap">{q.answer}</p>
                        </div>

                        {/* Note editor — only when this question is bookmarked */}
                        {isBookmarked && (
                          <div className="rounded-xl bg-brand-50/60 ring-1 ring-inset ring-brand-200 p-3 sm:p-4">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-brand-700">My note</p>
                              {!isEditingNote && (
                                <button
                                  type="button"
                                  onClick={() => setEditingNoteFor(q.id)}
                                  className="inline-flex items-center gap-1 text-xs text-brand-700 hover:text-brand-900"
                                >
                                  <Pencil className="w-3 h-3" strokeWidth={2.2} />
                                  {bm?.note ? 'Edit' : 'Add a note'}
                                </button>
                              )}
                            </div>
                            {isEditingNote ? (
                              <NoteEditor
                                defaultValue={bm?.note ?? ''}
                                onSave={(note) => handleSaveNote(q.id, note)}
                                onCancel={() => setEditingNoteFor(null)}
                                pending={pending}
                              />
                            ) : bm?.note ? (
                              <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">{bm.note}</p>
                            ) : (
                              <p className="text-sm text-ink-500 italic">No note yet — add one to remind yourself how you&apos;d frame the answer.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

function NoteEditor({
  defaultValue,
  onSave,
  onCancel,
  pending
}: {
  defaultValue: string;
  onSave: (note: string) => void;
  onCancel: () => void;
  pending: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="space-y-2">
      <textarea
        rows={3}
        className="input resize-none text-sm"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Your version of the answer, gotchas to remember, …"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSave(value)}
          disabled={pending}
          className="btn-primary btn-sm"
        >
          {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save note
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost btn-sm">
          <X className="w-3.5 h-3.5" />
          Cancel
        </button>
      </div>
    </div>
  );
}
