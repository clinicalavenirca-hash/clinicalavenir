import { requireStudent } from '@/lib/db/session';
import { fetchJob } from '@/lib/db/jobs';
import { AiAssistant } from '@/components/student/AiAssistant';

export const dynamic = 'force-dynamic';

export default async function AiAssistantPage({
  searchParams
}: {
  searchParams: { job?: string; mode?: string };
}) {
  const me = await requireStudent();

  // Deep-link from job board: ?job=<id>&mode=tailor|cover
  let prefill: { jobTitle: string; company: string; jobDescription: string } | null = null;
  if (searchParams.job) {
    const job = await fetchJob(searchParams.job);
    if (job) {
      prefill = {
        jobTitle: job.title,
        company: job.company,
        jobDescription: [job.description, ...(job.qualifications ?? [])].filter(Boolean).join('\n\n')
      };
    }
  }

  const mode = searchParams.mode === 'cover' ? 'cover' : 'tailor';

  return (
    <>
      <div className="mb-6">
        <span className="eyebrow">Career</span>
        <h1 className="mt-2 text-2xl sm:text-3xl">AI Assistant</h1>
        <p className="mt-1 text-ink-600">
          Tailor your resume to a specific job, or draft a cover letter — both based on the job
          description and the experience you supply. Outputs are starting points, always review
          before sending.
        </p>
      </div>
      <AiAssistant
        candidateName={me.name}
        initialMode={mode as 'tailor' | 'cover'}
        prefill={prefill}
      />
    </>
  );
}
