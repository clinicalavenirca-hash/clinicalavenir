import { cache } from 'react';
import type { InterviewTopic, InterviewQuestionRow, InterviewBookmark } from '@/lib/data';
import { supabaseServer } from '@/lib/supabase/server';

type TopicRow = {
  id: string;
  course_id: string;
  label: string;
  order_index: number;
};

type QuestionRow = {
  id: string;
  topic_id: string;
  question: string;
  answer: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order_index: number;
};

type BookmarkRow = {
  question_id: string;
  note: string | null;
  created_at: string;
};

function rowToTopic(r: TopicRow): InterviewTopic {
  return {
    id: r.id,
    courseId: r.course_id,
    label: r.label,
    orderIndex: r.order_index
  };
}

function rowToQuestion(r: QuestionRow): InterviewQuestionRow {
  return {
    id: r.id,
    topicId: r.topic_id,
    question: r.question,
    answer: r.answer,
    difficulty: r.difficulty,
    orderIndex: r.order_index
  };
}

function rowToBookmark(r: BookmarkRow): InterviewBookmark {
  return {
    questionId: r.question_id,
    note: r.note,
    createdAt: r.created_at
  };
}

/** All topics across all courses, ordered for stable rendering. */
export const fetchInterviewTopics = cache(async (): Promise<InterviewTopic[]> => {
  const supa = supabaseServer();
  if (!supa) return [];
  const { data, error } = await supa
    .from('interview_topics')
    .select('id, course_id, label, order_index')
    .order('course_id', { ascending: true })
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) { console.error('[fetchInterviewTopics]', error.message); return []; }
  return ((data ?? []) as TopicRow[]).map(rowToTopic);
});

/** All questions across all topics, ordered for stable rendering. */
export const fetchInterviewQuestions = cache(async (): Promise<InterviewQuestionRow[]> => {
  const supa = supabaseServer();
  if (!supa) return [];
  const { data, error } = await supa
    .from('interview_questions')
    .select('id, topic_id, question, answer, difficulty, order_index')
    .order('topic_id', { ascending: true })
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) { console.error('[fetchInterviewQuestions]', error.message); return []; }
  return ((data ?? []) as QuestionRow[]).map(rowToQuestion);
});

/** Bookmarks for the signed-in student. */
export const fetchMyBookmarks = cache(async (userId: string): Promise<InterviewBookmark[]> => {
  const supa = supabaseServer();
  if (!supa) return [];
  const { data, error } = await supa
    .from('interview_bookmarks')
    .select('question_id, note, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { console.error('[fetchMyBookmarks]', error.message); return []; }
  return ((data ?? []) as BookmarkRow[]).map(rowToBookmark);
});
