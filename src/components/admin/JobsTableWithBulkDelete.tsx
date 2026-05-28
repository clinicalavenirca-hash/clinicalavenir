'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Trash2, Loader2 } from 'lucide-react';
import type { Job, Course } from '@/lib/data';
import { initials, formatDate, isJobDeadlinePassed } from '@/lib/utils';
import { DeleteJobButton } from '@/components/admin/DeleteJobButton';
import { bulkDeleteJobs } from '@/app/actions/jobs';
import { toast } from '@/components/ui/Toast';

export function JobsTableWithBulkDelete({ jobs, courses }: { jobs: Job[]; courses: Course[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  function toggleAll(checked: boolean) {
    if (checked) {
      setSelected(new Set(jobs.map((j) => j.id)));
    } else {
      setSelected(new Set());
    }
  }

  function toggleJob(jobId: string, checked: boolean) {
    const next = new Set(selected);
    if (checked) {
      next.add(jobId);
    } else {
      next.delete(jobId);
    }
    setSelected(next);
  }

  function handleBulkDelete() {
    if (!window.confirm(`Delete ${selected.size} job${selected.size === 1 ? '' : 's'}? This cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      const res = await bulkDeleteJobs(Array.from(selected));
      if (res?.error) {
        toast(res.error, 'error');
        return;
      }
      toast(`Deleted ${res.deleted} job${res.deleted === 1 ? '' : 's'}.`, 'success');
      setSelected(new Set());
    });
  }

  const allChecked = jobs.length > 0 && selected.size === jobs.length;
  const indeterminate = selected.size > 0 && selected.size < jobs.length;

  return (
    <>
      {selected.size > 0 && (
        <div className="mb-4 flex items-center justify-between gap-4 p-3 bg-brand-50 rounded-lg border border-brand-200">
          <p className="text-sm font-medium text-brand-900">
            {selected.size} job{selected.size === 1 ? '' : 's'} selected
          </p>
          <button
            onClick={handleBulkDelete}
            disabled={pending}
            className="btn-danger btn-sm"
          >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {pending ? 'Deleting...' : 'Delete selected'}
          </button>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto scroll-thin">
          <table className="table">
            <thead>
              <tr>
                <th className="w-10">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = indeterminate;
                    }}
                    onChange={(e) => toggleAll(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                </th>
                <th>Role</th>
                <th>Track</th>
                <th>Type</th>
                <th>Seniority</th>
                <th>Posted</th>
                <th>Deadline</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => {
                const c = courses.find((cs) => cs.slug === j.courseSlug);
                const isSelected = selected.has(j.id);
                return (
                  <tr key={j.id} className={isSelected ? 'bg-brand-50' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => toggleJob(j.id, e.target.checked)}
                        className="rounded text-brand-600 focus:ring-brand-500"
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center text-xs font-semibold flex-shrink-0">
                          {initials(j.company)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-ink-900 text-sm truncate">{j.title}</p>
                          <p className="text-xs text-ink-500 truncate">
                            {j.company} · {j.city}
                          </p>
                        </div>
                        {j.entryLevelFriendly && <span className="badge-accent text-[10px]">Entry</span>}
                      </div>
                    </td>
                    <td>{c && <span className="badge-brand text-[11px]">{c.title}</span>}</td>
                    <td className="text-sm text-ink-600 whitespace-nowrap">{j.type}</td>
                    <td className="text-sm text-ink-600 whitespace-nowrap">{j.seniority}</td>
                    <td className="text-sm text-ink-600 whitespace-nowrap">{formatDate(j.postedAt)}</td>
                    <td className="text-sm whitespace-nowrap">
                      <span
                        className={
                          isJobDeadlinePassed(j)
                            ? 'text-rose-600 font-medium'
                            : 'text-ink-600'
                        }
                      >
                        {j.deadline ? formatDate(j.deadline) : '—'}
                      </span>
                      {isJobDeadlinePassed(j) && (
                        <span className="ml-2 badge-danger text-[10px]">Past</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/jobs/${j.id}/applicants`}
                          className="btn-ghost btn-sm"
                        >
                          Applicants
                        </Link>
                        <Link
                          href={`/admin/jobs/${j.id}/edit`}
                          className="btn-ghost btn-sm"
                        >
                          Edit
                        </Link>
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
              <p className="text-sm text-ink-500">
                No jobs posted yet. Click <strong className="text-ink-700">Post a role</strong> to
                add the first one.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
