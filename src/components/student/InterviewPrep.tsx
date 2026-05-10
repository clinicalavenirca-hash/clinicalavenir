'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Bookmark, Mic } from 'lucide-react';
import type { InterviewQuestion } from '@/lib/data';
import { cn } from '@/lib/utils';

export function InterviewPrep({ questions, topics }: { questions: InterviewQuestion[]; topics: string[] }) {
  const [topic, setTopic] = useState<string>('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<number>(-1);

  const filtered = questions.filter((qa, i) => {
    const topicOk = topic === 'all' || qa.topic === topic;
    const queryOk = q.trim() === '' || qa.question.toLowerCase().includes(q.toLowerCase());
    return topicOk && queryOk;
  });

  return (
    <>
      <div className="card card-pad mb-5">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button onClick={() => setTopic('all')} className={cn('px-3 py-1.5 rounded-full text-sm font-medium transition-colors', topic === 'all' ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-700 hover:bg-ink-200')}>All</button>
          {topics.map(t => (
            <button key={t} onClick={() => setTopic(t)} className={cn('px-3 py-1.5 rounded-full text-sm font-medium transition-colors', topic === t ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-700 hover:bg-ink-200')}>{t}</button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search questions, e.g. 'protocol deviation'…" className="input pl-9" />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((qa, i) => (
          <div key={qa.question} className="card overflow-hidden">
            <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full px-5 py-4 flex items-start justify-between gap-4 text-left">
              <div className="min-w-0 flex-1">
                <span className="badge-brand mb-2">{qa.topic}</span>
                <p className="font-semibold text-ink-900 text-base sm:text-lg leading-snug">{qa.question}</p>
              </div>
              <ChevronDown className={cn('w-5 h-5 text-ink-400 flex-shrink-0 mt-1 transition-transform', open === i && 'rotate-180')} />
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 border-t border-ink-100 pt-4">
                    <p className="eyebrow mb-2">Sample answer</p>
                    <p className="text-ink-700 leading-relaxed">{qa.answer}</p>
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      <button className="btn-ghost btn-sm"><Bookmark className="w-4 h-4" /> Save to my notes</button>
                      <button className="btn-ghost btn-sm"><Mic className="w-4 h-4" /> Practice answer</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card card-pad text-center py-12">
            <p className="text-sm text-ink-500">No questions match your search.</p>
          </div>
        )}
      </div>
    </>
  );
}
