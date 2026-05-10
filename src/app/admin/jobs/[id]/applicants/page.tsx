import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { fetchJob } from '@/lib/db/jobs';
import { fetchJobApplicants } from '@/lib/db/jobApplications';
import { ApplicantsBoard } from '@/components/admin/ApplicantsBoard';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { id: string } }) {
  const job = await fetchJob(params.id);
  if (!job) notFound();
  const applicants = await fetchJobApplicants(job.id);

  return (
    <>
      <div className="mb-4">
        <Link href="/admin/jobs" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700">
          <ArrowLeft className="w-4 h-4" /> All jobs
        </Link>
      </div>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <span className="eyebrow">Applicants</span>
          <h1 className="mt-2 text-2xl sm:text-3xl">{job.title}</h1>
          <p className="mt-1 text-ink-600">{job.company} · {job.city}, {job.country} · {applicants.length} applicant{applicants.length === 1 ? '' : 's'}</p>
        </div>
        <Link href={`/admin/jobs/${job.id}/edit`} className="btn-secondary btn-md">Edit role</Link>
      </div>
      <ApplicantsBoard initial={applicants} />
    </>
  );
}
