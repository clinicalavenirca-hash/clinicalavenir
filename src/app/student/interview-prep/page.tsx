import { requireStudent } from '@/lib/db/session';
import { fetchAllCourses } from '@/lib/db/courses';
import { fetchEnrolledCourseSlugs } from '@/lib/db/progress';
import {
  fetchInterviewTopics,
  fetchInterviewQuestions,
  fetchMyBookmarks
} from '@/lib/db/interview';
import { InterviewPrep } from '@/components/student/InterviewPrep';
import { InterviewRealtime } from '@/components/realtime/InterviewRealtime';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const me = await requireStudent();
  const [courses, topics, questions, bookmarks, enrolledSlugs] = await Promise.all([
    fetchAllCourses(),
    fetchInterviewTopics(),
    fetchInterviewQuestions(),
    fetchMyBookmarks(me.id),
    fetchEnrolledCourseSlugs(me.id)
  ]);

  return (
    <>
      <InterviewRealtime />
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <span className="eyebrow">Learning</span>
          <h1 className="mt-2 text-2xl sm:text-3xl">Interview Prep</h1>
          <p className="mt-1 text-ink-600">
            Curated by your instructor. Save anything you want to revisit before a real screen.
          </p>
        </div>
      </div>
      <InterviewPrep
        courses={courses}
        topics={topics}
        questions={questions}
        bookmarks={bookmarks}
        enrolledSlugs={enrolledSlugs}
      />
    </>
  );
}
