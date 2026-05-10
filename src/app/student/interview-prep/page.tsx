import { interviewQuestions } from '@/lib/data';
import { InterviewPrep } from '@/components/student/InterviewPrep';

export default function Page() {
  const topics = Array.from(new Set(interviewQuestions.map(q => q.topic)));
  return (
    <>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <span className="eyebrow">Learning</span>
          <h1 className="mt-2 text-2xl sm:text-3xl">Interview Prep</h1>
          <p className="mt-1 text-ink-600">Curated questions for FDA, Health Canada, ICH, GCP, GMP — with sample answers from working professionals.</p>
        </div>
      </div>
      <InterviewPrep questions={interviewQuestions} topics={topics} />
    </>
  );
}
