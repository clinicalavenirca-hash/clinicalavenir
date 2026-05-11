'use client';
import { useState, useTransition, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, ChevronDown, Save, X, Loader2 } from 'lucide-react';
import type { Course, InterviewTopic, InterviewQuestionRow } from '@/lib/data';
import { toast } from '@/components/ui/Toast';
import {
  createTopic, updateTopic, deleteTopic,
  createQuestion, updateQuestion, deleteQuestion,
  type QuestionInput
} from '@/app/actions/interview';
import { cn } from '@/lib/utils';

type Diff = QuestionInput['difficulty'];

const DIFFICULTY_TONES: Record<Diff, string> = {
  beginner: 'badge-success',
  intermediate: 'badge-warning',
  advanced: 'badge-accent'
};

/**
 * Admin interview prep manager. Top-level: course tabs. Within each course
 * tab: a list of topics (each expandable to show its questions) with an
 * inline editor for both topic and question CRUD. All mutations go through
 * server actions which revalidate the student-facing page so changes
 * appear immediately.
 */
export function InterviewAdmin({
  courses,
  topics,
  questions
}: {
  courses: Course[];
  topics: InterviewTopic[];
  questions: InterviewQuestionRow[];
}) {
  const [activeCourseId, setActiveCourseId] = useState<string>(courses[0]?.id ?? '');
  const [topicsState, setTopicsState] = useState(topics);
  const [questionsState, setQuestionsState] = useState(questions);
  const [editingTopic, setEditingTopic] = useState<string | 'new' | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [addingQuestionTo, setAddingQuestionTo] = useState<string | null>(null);
  const [openTopicId, setOpenTopicId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const courseTopics = useMemo(
    () => topicsState.filter((t) => t.courseId === activeCourseId),
    [topicsState, activeCourseId]
  );

  const questionsByTopic = useMemo(() => {
    const map = new Map<string, InterviewQuestionRow[]>();
    for (const q of questionsState) {
      const list = map.get(q.topicId) ?? [];
      list.push(q);
      map.set(q.topicId, list);
    }
    return map;
  }, [questionsState]);

  // ---- TOPIC actions -------------------------------------------------------
  function handleCreateTopic(label: string, orderIndex: number) {
    startTransition(async () => {
      const res = await createTopic({ courseId: activeCourseId, label, orderIndex });
      if (res?.error) { toast(res.error, 'error'); return; }
      toast('Topic added.', 'success');
      setTopicsState((prev) =>
        [...prev, { id: `tmp-${Date.now()}`, courseId: activeCourseId, label, orderIndex }]
          .sort((a, b) => a.orderIndex - b.orderIndex)
      );
      setEditingTopic(null);
    });
  }

  function handleUpdateTopic(id: string, label: string, orderIndex: number) {
    startTransition(async () => {
      const res = await updateTopic(id, { label, orderIndex });
      if (res?.error) { toast(res.error, 'error'); return; }
      toast('Topic updated.', 'success');
      setTopicsState((prev) =>
        prev.map((t) => (t.id === id ? { ...t, label, orderIndex } : t))
          .sort((a, b) => a.orderIndex - b.orderIndex)
      );
      setEditingTopic(null);
    });
  }

  function handleDeleteTopic(id: string, label: string) {
    const questionCount = questionsByTopic.get(id)?.length ?? 0;
    const msg = questionCount > 0
      ? `Delete topic "${label}" and its ${questionCount} question${questionCount === 1 ? '' : 's'}? This cannot be undone.`
      : `Delete topic "${label}"?`;
    if (!confirm(msg)) return;
    startTransition(async () => {
      const res = await deleteTopic(id);
      if (res?.error) { toast(res.error, 'error'); return; }
      toast('Topic deleted.', 'info');
      setTopicsState((prev) => prev.filter((t) => t.id !== id));
      setQuestionsState((prev) => prev.filter((q) => q.topicId !== id));
      if (openTopicId === id) setOpenTopicId(null);
    });
  }

  // ---- QUESTION actions ----------------------------------------------------
  function handleCreateQuestion(topicId: string, input: Omit<QuestionInput, 'topicId'>) {
    startTransition(async () => {
      const res = await createQuestion({ ...input, topicId });
      if (res?.error) { toast(res.error, 'error'); return; }
      toast('Question added.', 'success');
      setQuestionsState((prev) => [
        ...prev,
        {
          id: `tmp-${Date.now()}`,
          topicId,
          question: input.question.trim(),
          answer: input.answer.trim(),
          difficulty: input.difficulty,
          orderIndex: input.orderIndex
        }
      ].sort((a, b) => a.orderIndex - b.orderIndex));
      setAddingQuestionTo(null);
    });
  }

  function handleUpdateQuestion(id: string, input: QuestionInput) {
    startTransition(async () => {
      const res = await updateQuestion(id, input);
      if (res?.error) { toast(res.error, 'error'); return; }
      toast('Question updated.', 'success');
      setQuestionsState((prev) =>
        prev.map((q) => (q.id === id ? { ...q, ...input } : q))
          .sort((a, b) => a.orderIndex - b.orderIndex)
      );
      setEditingQuestion(null);
    });
  }

  function handleDeleteQuestion(id: string, question: string) {
    if (!confirm(`Delete "${question.slice(0, 80)}${question.length > 80 ? '…' : ''}"?`)) return;
    startTransition(async () => {
      const res = await deleteQuestion(id);
      if (res?.error) { toast(res.error, 'error'); return; }
      toast('Question deleted.', 'info');
      setQuestionsState((prev) => prev.filter((q) => q.id !== id));
    });
  }

  if (courses.length === 0) {
    return (
      <div className="card card-pad text-center py-16">
        <p className="text-sm text-ink-500">Add a course first — interview topics are organized under each track.</p>
      </div>
    );
  }

  const nextTopicOrder = courseTopics.length === 0 ? 10 : Math.max(...courseTopics.map((t) => t.orderIndex)) + 10;

  return (
    <div className="space-y-6">
      {/* Course tabs */}
      <div className="flex flex-wrap gap-2 border-b border-ink-200 pb-3">
        {courses.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => { setActiveCourseId(c.id); setOpenTopicId(null); }}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors',
              activeCourseId === c.id
                ? 'bg-ink-950 text-white'
                : 'bg-white text-ink-700 ring-1 ring-inset ring-ink-200 hover:ring-ink-400'
            )}
          >
            {c.title}
            <span className="ml-2 opacity-60 tabular-nums">
              {topicsState.filter((t) => t.courseId === c.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* New topic CTA */}
      {editingTopic === 'new' ? (
        <TopicEditor
          defaults={{ label: '', orderIndex: nextTopicOrder }}
          onSave={(input) => handleCreateTopic(input.label, input.orderIndex)}
          onCancel={() => setEditingTopic(null)}
          pending={pending}
          isNew
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditingTopic('new')}
          className="card card-pad card-hover w-full text-left flex items-center gap-3 hover:border-ink-950"
        >
          <span className="inline-flex w-10 h-10 rounded-xl bg-ink-950 text-white items-center justify-center flex-shrink-0">
            <Plus className="w-5 h-5" strokeWidth={2.2} />
          </span>
          <div>
            <p className="font-semibold text-ink-950">New topic</p>
            <p className="text-xs text-ink-500">e.g. ICH-GCP, Health Canada, FDA, GCP, GMP</p>
          </div>
        </button>
      )}

      {/* Topics list */}
      {courseTopics.length === 0 && editingTopic !== 'new' && (
        <div className="card card-pad text-center py-12">
          <p className="text-sm text-ink-500">No topics under this course yet. Add the first one above.</p>
        </div>
      )}

      <ul className="space-y-3">
        {courseTopics.map((topic) => {
          const isOpen = openTopicId === topic.id;
          const isEditingThis = editingTopic === topic.id;
          const tQuestions = (questionsByTopic.get(topic.id) ?? []).sort((a, b) => a.orderIndex - b.orderIndex);
          const nextQOrder = tQuestions.length === 0 ? 10 : Math.max(...tQuestions.map((q) => q.orderIndex)) + 10;

          return (
            <li key={topic.id} className="card overflow-hidden">
              {isEditingThis ? (
                <TopicEditor
                  defaults={{ label: topic.label, orderIndex: topic.orderIndex }}
                  onSave={(input) => handleUpdateTopic(topic.id, input.label, input.orderIndex)}
                  onCancel={() => setEditingTopic(null)}
                  onDelete={() => handleDeleteTopic(topic.id, topic.label)}
                  pending={pending}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setOpenTopicId(isOpen ? null : topic.id)}
                  className="w-full p-4 sm:p-5 flex items-start justify-between gap-4 text-left hover:bg-brand-50/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-ink-500 tabular-nums">
                        {String(topic.orderIndex).padStart(3, '0')}
                      </span>
                      <p className="font-semibold text-ink-950">{topic.label}</p>
                    </div>
                    <p className="mt-1 text-xs text-ink-500">
                      {tQuestions.length} question{tQuestions.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); setEditingTopic(topic.id); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setEditingTopic(topic.id); } }}
                      className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ink-950 px-2 py-1 rounded-md hover:bg-ink-100 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" strokeWidth={2.2} />
                      Edit
                    </span>
                    <ChevronDown
                      className={cn('w-4 h-4 text-ink-400 transition-transform', isOpen && 'rotate-180')}
                      strokeWidth={2.2}
                    />
                  </div>
                </button>
              )}

              <AnimatePresence initial={false}>
                {isOpen && !isEditingThis && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden border-t border-ink-100 bg-brand-50/20"
                  >
                    <div className="p-4 sm:p-5 space-y-3">
                      {/* Questions list */}
                      {tQuestions.length === 0 && addingQuestionTo !== topic.id && (
                        <p className="text-sm text-ink-500 italic">No questions yet under this topic.</p>
                      )}
                      {tQuestions.map((q) => (
                        editingQuestion === q.id ? (
                          <QuestionEditor
                            key={q.id}
                            defaults={q}
                            onSave={(input) => handleUpdateQuestion(q.id, { ...input, topicId: topic.id })}
                            onCancel={() => setEditingQuestion(null)}
                            onDelete={() => handleDeleteQuestion(q.id, q.question)}
                            pending={pending}
                          />
                        ) : (
                          <div key={q.id} className="rounded-xl bg-white ring-1 ring-ink-100 p-3 sm:p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-ink-500 tabular-nums">
                                    {String(q.orderIndex).padStart(3, '0')}
                                  </span>
                                  <span className={cn(DIFFICULTY_TONES[q.difficulty], 'capitalize text-[10px]')}>
                                    {q.difficulty}
                                  </span>
                                </div>
                                <p className="font-semibold text-ink-950 text-sm">{q.question}</p>
                                <p className="mt-1 text-xs text-ink-600 line-clamp-2">{q.answer}</p>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setEditingQuestion(q.id)}
                                  className="p-1.5 rounded-md text-ink-500 hover:text-ink-950 hover:bg-ink-100"
                                  aria-label="Edit"
                                >
                                  <Pencil className="w-3.5 h-3.5" strokeWidth={2.2} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteQuestion(q.id, q.question)}
                                  disabled={pending}
                                  className="p-1.5 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                                  aria-label="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" strokeWidth={2.2} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      ))}

                      {/* Add question CTA / editor */}
                      {addingQuestionTo === topic.id ? (
                        <QuestionEditor
                          defaults={{
                            id: '',
                            topicId: topic.id,
                            question: '',
                            answer: '',
                            difficulty: 'beginner',
                            orderIndex: nextQOrder
                          }}
                          onSave={(input) => handleCreateQuestion(topic.id, input)}
                          onCancel={() => setAddingQuestionTo(null)}
                          pending={pending}
                          isNew
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAddingQuestionTo(topic.id)}
                          className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-ink-300 text-sm text-ink-700 hover:border-ink-950 hover:text-ink-950 transition-colors"
                        >
                          <Plus className="w-4 h-4" strokeWidth={2.2} />
                          Add question
                        </button>
                      )}
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

// =========================================================================
// Inline editors
// =========================================================================

function TopicEditor({
  defaults,
  onSave,
  onCancel,
  onDelete,
  pending,
  isNew = false
}: {
  defaults: { label: string; orderIndex: number };
  onSave: (input: { label: string; orderIndex: number }) => void;
  onCancel: () => void;
  onDelete?: () => void;
  pending: boolean;
  isNew?: boolean;
}) {
  const [label, setLabel] = useState(defaults.label);
  const [orderIndex, setOrderIndex] = useState<number | ''>(defaults.orderIndex);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) { toast('Label is required.', 'warning'); return; }
    onSave({ label, orderIndex: typeof orderIndex === 'number' ? orderIndex : 100 });
  }

  return (
    <form onSubmit={submit} className="card card-pad space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink-950">{isNew ? 'New topic' : 'Edit topic'}</p>
        <button type="button" onClick={onCancel} className="text-ink-500 hover:text-ink-950">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_8rem] gap-4">
        <div>
          <label className="label">Label *</label>
          <input
            required
            className="input"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="ICH-GCP"
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
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="submit" disabled={pending} className="btn-primary btn-md">
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isNew ? 'Add topic' : 'Save'}
          </button>
          <button type="button" onClick={onCancel} className="btn-ghost btn-md">Cancel</button>
        </div>
        {onDelete && !isNew && (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={2.2} />
            Delete topic
          </button>
        )}
      </div>
    </form>
  );
}

function QuestionEditor({
  defaults,
  onSave,
  onCancel,
  onDelete,
  pending,
  isNew = false
}: {
  defaults: { id: string; topicId: string; question: string; answer: string; difficulty: Diff; orderIndex: number };
  onSave: (input: Omit<QuestionInput, 'topicId'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
  pending: boolean;
  isNew?: boolean;
}) {
  const [question, setQuestion] = useState(defaults.question);
  const [answer, setAnswer] = useState(defaults.answer);
  const [difficulty, setDifficulty] = useState<Diff>(defaults.difficulty);
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
      difficulty,
      orderIndex: typeof orderIndex === 'number' ? orderIndex : 100
    });
  }

  return (
    <form onSubmit={submit} className="rounded-xl bg-white ring-1 ring-ink-200 p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink-950">{isNew ? 'New question' : 'Edit question'}</p>
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
          placeholder="What are the 13 principles of ICH-GCP?"
        />
      </div>
      <div>
        <label className="label">Sample answer *</label>
        <textarea
          required
          rows={5}
          className="input resize-none"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_8rem] gap-4">
        <div>
          <label className="label">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Diff)}
            className="input"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
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
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="submit" disabled={pending} className="btn-primary btn-sm">
            {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isNew ? 'Add' : 'Save'}
          </button>
          <button type="button" onClick={onCancel} className="btn-ghost btn-sm">Cancel</button>
        </div>
        {onDelete && !isNew && (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={2.2} />
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
