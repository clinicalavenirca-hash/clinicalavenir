'use server';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { requireAdmin, requireStudent } from '@/lib/db/session';

// =========================================================================
// ADMIN — topics
// =========================================================================
export async function createTopic(input: { courseId: string; label: string; orderIndex: number }) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  if (!input.courseId || !input.label?.trim()) {
    return { error: 'Course and label are required.' };
  }
  const { error } = await supa.from('interview_topics').insert({
    course_id: input.courseId,
    label: input.label.trim(),
    order_index: Number.isFinite(input.orderIndex) ? input.orderIndex : 100
  });
  if (error) return { error: error.message };
  revalidatePath('/admin/interview');
  revalidatePath('/student/interview-prep');
  return { ok: true };
}

export async function updateTopic(id: string, input: { label: string; orderIndex: number }) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa
    .from('interview_topics')
    .update({
      label: input.label.trim(),
      order_index: Number.isFinite(input.orderIndex) ? input.orderIndex : 100
    })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/interview');
  revalidatePath('/student/interview-prep');
  return { ok: true };
}

export async function deleteTopic(id: string) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  // Questions cascade via ON DELETE CASCADE.
  const { error } = await supa.from('interview_topics').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/interview');
  revalidatePath('/student/interview-prep');
  return { ok: true };
}

// =========================================================================
// ADMIN — questions
// =========================================================================
export type QuestionInput = {
  topicId: string;
  question: string;
  answer: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  orderIndex: number;
};

export async function createQuestion(input: QuestionInput) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  if (!input.topicId || !input.question?.trim() || !input.answer?.trim()) {
    return { error: 'Topic, question and answer are required.' };
  }
  const { error } = await supa.from('interview_questions').insert({
    topic_id: input.topicId,
    question: input.question.trim(),
    answer: input.answer.trim(),
    difficulty: input.difficulty,
    order_index: Number.isFinite(input.orderIndex) ? input.orderIndex : 100
  });
  if (error) return { error: error.message };
  revalidatePath('/admin/interview');
  revalidatePath('/student/interview-prep');
  return { ok: true };
}

export async function updateQuestion(id: string, input: QuestionInput) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa
    .from('interview_questions')
    .update({
      topic_id: input.topicId,
      question: input.question.trim(),
      answer: input.answer.trim(),
      difficulty: input.difficulty,
      order_index: Number.isFinite(input.orderIndex) ? input.orderIndex : 100
    })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/interview');
  revalidatePath('/student/interview-prep');
  return { ok: true };
}

export async function deleteQuestion(id: string) {
  await requireAdmin();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const { error } = await supa.from('interview_questions').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/interview');
  revalidatePath('/student/interview-prep');
  return { ok: true };
}

// =========================================================================
// STUDENT — bookmarks (save-to-my-notes)
// =========================================================================
export async function toggleBookmark(questionId: string) {
  const me = await requireStudent();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };

  // Is it already bookmarked? Delete if so; otherwise insert.
  const { data: existing } = await supa
    .from('interview_bookmarks')
    .select('question_id')
    .eq('user_id', me.id)
    .eq('question_id', questionId)
    .maybeSingle();

  if (existing) {
    const { error } = await supa
      .from('interview_bookmarks')
      .delete()
      .eq('user_id', me.id)
      .eq('question_id', questionId);
    if (error) return { error: error.message };
    revalidatePath('/student/interview-prep');
    return { ok: true, bookmarked: false };
  } else {
    const { error } = await supa
      .from('interview_bookmarks')
      .insert({ user_id: me.id, question_id: questionId });
    if (error) return { error: error.message };
    revalidatePath('/student/interview-prep');
    return { ok: true, bookmarked: true };
  }
}

export async function updateBookmarkNote(questionId: string, note: string) {
  const me = await requireStudent();
  const supa = supabaseServer();
  if (!supa) return { error: 'Supabase not configured' };
  const trimmed = note.trim();
  const { error } = await supa
    .from('interview_bookmarks')
    .update({ note: trimmed === '' ? null : trimmed })
    .eq('user_id', me.id)
    .eq('question_id', questionId);
  if (error) return { error: error.message };
  revalidatePath('/student/interview-prep');
  return { ok: true };
}
