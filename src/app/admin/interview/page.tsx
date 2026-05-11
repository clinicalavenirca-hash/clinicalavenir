import { fetchAllCourses } from '@/lib/db/courses';
import { fetchInterviewTopics, fetchInterviewQuestions } from '@/lib/db/interview';
import { InterviewAdmin } from '@/components/admin/InterviewAdmin';

export const dynamic = 'force-dynamic';

export default async function InterviewAdminPage() {
  const [courses, topics, questions] = await Promise.all([
    fetchAllCourses(),
    fetchInterviewTopics(),
    fetchInterviewQuestions()
  ]);

  return (
    <>
      <div className="mb-6">
        <span className="eyebrow">Curriculum</span>
        <h1 className="mt-2 text-2xl sm:text-3xl">Interview Prep</h1>
        <p className="mt-1 text-ink-600">
          Pick a course → add topics under it → add questions + sample answers under each topic.
          Students see what you publish here in real time.
        </p>
      </div>
      <InterviewAdmin courses={courses} topics={topics} questions={questions} />
    </>
  );
}
