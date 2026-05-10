import Link from 'next/link';
import { Plus } from 'lucide-react';
import { fetchAllJobs } from '@/lib/db/jobs';
import { fetchAllCourses } from '@/lib/db/courses';
import { initials, formatDate, isJobDeadlinePassed } from '@/lib/utils';
import { DeleteJobButton } from '@/components/admin/DeleteJobButton';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [jobs, courses] = await Promise.all([fetchAllJobs(), fetchAllCourses()]);
  return (
    <>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <span className="eyebrow">Career</span>
          <h1 className="mt-2 text-2xl sm:text-3xl">Jobs</h1>
          <p className="mt-1 text-ink-600">Post roles tagged to a course track. Only enrolled students see relevant listings.</p>
        </div>
        <Link href="/admin/jobs/new" className="btn-primary btn-md"><Plus className="w-4 h-4" strokeWidth={2.5} /> Post a role</Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto scroll-thin">
          <table className="table">
            <thead><tr><th>Role</th><th>Track</th><th>Type</th><th>Seniority</th><th>Posted</th><th>Deadline</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {jobs.map((j) => {
                const c = courses.find((cs) => cs.slug === j.courseSlug);
                return (
                  <tr key={j.id}>
                    <td>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center text-xs font-semibold flex-shrink-0">{initials(j.company)}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-ink-900 text-sm truncate">{j.title}</p>
                          <p className="text-xs text-ink-500 truncate">{j.company} · {j.city}</p>
                        </div>
                        {j.entryLevelFriendly && <span className="badge-accent text-[10px]">Entry</span>}
                      </div>
                    </td>
                    <td>{c && <span className="badge-brand text-[11px]">{c.title}</span>}</td>
                    <td className="text-sm text-ink-600 whitespace-nowrap">{j.type}</td>
                    <td className="text-sm text-ink-600 whitespace-nowrap">{j.seniority}</td>
                    <td className="text-sm text-ink-600 whitespace-nowrap">{formatDate(j.postedAt)}</td>
                    <td className="text-sm whitespace-nowrap">
                      <span className={isJobDeadlinePassed(j) ? 'text-rose-600 font-medium' : 'text-ink-600'}>
                        {j.deadline ? formatDate(j.deadline) : '—'}
                      </span>
                      {isJobDeadlinePassed(j) && <span className="ml-2 badge-danger text-[10px]">Past</span>}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/jobs/${j.id}/applicants`} className="btn-ghost btn-sm">Applicants</Link>
                        <Link href={`/admin/jobs/${j.id}/edit`} className="btn-ghost btn-sm">Edit</Link>
                        <DeleteJobButton id={j.id} title={j.title} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {jobs.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-sm text-ink-500">No jobs posted yet. Click <strong className="text-ink-700">Post a role</strong> to add the first one.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
