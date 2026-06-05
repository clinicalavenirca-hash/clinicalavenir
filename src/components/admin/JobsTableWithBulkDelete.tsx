'use client';
import { useState, useTransition, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Job, Course } from '@/lib/data';
import { initials, formatDate, isJobDeadlinePassed } from '@/lib/utils';
import { DeleteJobButton } from '@/components/admin/DeleteJobButton';
import { bulkDeleteJobs } from '@/app/actions/jobs';
import { toast } from '@/components/ui/Toast';

const PAGE_SIZE = 20;

const DATE_WINDOWS: Array<{ label: string; days: number | null }> = [
  { label: 'Any time', days: null },
  { label: 'Last 24 hours', days: 1 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 }
];

export function JobsTableWithBulkDelete({ jobs, courses }: { jobs: Job[]; courses: Course[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState('');
  const [track, setTrack] = useState('');
  const [postedWithin, setPostedWithin] = useState<string>('');
  const [published, setPublished] = useState<string>('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const days = postedWithin ? Number(postedWithin) : null;
    const cutoff = days ? Date.now() - days * 24 * 60 * 60 * 1000 : null;
    const needle = q.trim().toLowerCase();
    return jobs.filter((j) => {
      const matchQ =
        needle === '' ||
        j.title.toLowerCase().includes(needle) ||
        j.company.toLowerCase().includes(needle) ||
        (j.city ?? '').toLowerCase().includes(needle);
      const matchDate = cutoff === null || new Date(j.postedAt).getTime() >= cutoff;
      const matchTrack = !track || j.courseSlug === track;
      const matchPublished =
        !published ||
        (published === 'published' && j.isPublished !== false) ||
        (published === 'draft' && j.isPublished === false);
      return matchQ && matchDate && matchTrack && matchPublished;
    });
  }, [jobs, q, track, postedWithin, published]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
    // Drop selections that no longer match the visible filter window.
    setSelected((prev) => {
      const visibleIds = new Set(filtered.map((j) => j.id));
      const next = new Set<string>();
      prev.forEach((id) => {
        if (visibleIds.has(id)) next.add(id);
      });
      return next;
    });
  }, [q, track, postedWithin, published, filtered]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const start = (page - 1) * PAGE_SIZE;
  const pageJobs = filtered.slice(start, start + PAGE_SIZE);

  function togglePageAll(checked: boolean) {
    const next = new Set(selected);
    pageJobs.forEach((j) => {
      if (checked) next.add(j.id);
      else next.delete(j.id);
    });
    setSelected(next);
  }

  function toggleJob(jobId: string, checked: boolean) {
    const next = new Set(selected);
    if (checked) next.add(jobId);
    else next.delete(jobId);
    setSelected(next);
  }

  function selectAllFiltered() {
    setSelected(new Set(filtered.map((j) => j.id)));
  }

  function clearSelection() {
    setSelected(new Set());
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

  const pageSelectedCount = pageJobs.filter((j) => selected.has(j.id)).length;
  const allPageChecked = pageJobs.length > 0 && pageSelectedCount === pageJobs.length;
  const indeterminate = pageSelectedCount > 0 && pageSelectedCount < pageJobs.length;

  return (
    <>
      <div className="card card-pad mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Title, company, city…"
              className="input pl-9 !py-2.5 !text-sm"
            />
          </div>
          <select value={track} onChange={(e) => setTrack(e.target.value)} className="input !py-2.5 !text-sm">
            <option value="">All tracks</option>
            {courses.map((c) => (
              <option key={c.slug} value={c.slug}>{c.title}</option>
            ))}
          </select>
          <select value={postedWithin} onChange={(e) => setPostedWithin(e.target.value)} className="input !py-2.5 !text-sm">
            {DATE_WINDOWS.map((d) => (
              <option key={d.label} value={d.days ?? ''}>{d.label}</option>
            ))}
          </select>
          <select value={published} onChange={(e) => setPublished(e.target.value)} className="input !py-2.5 !text-sm">
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mb-4 flex items-center justify-between gap-4 p-3 bg-brand-50 rounded-lg border border-brand-200 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-sm font-medium text-brand-900">
              {selected.size} job{selected.size === 1 ? '' : 's'} selected
            </p>
            {selected.size < filtered.length && (
              <button onClick={selectAllFiltered} className="text-xs font-medium text-brand-700 hover:underline">
                Select all {filtered.length} matching
              </button>
            )}
            <button onClick={clearSelection} className="text-xs font-medium text-ink-600 hover:underline">
              Clear
            </button>
          </div>
          <button onClick={handleBulkDelete} disabled={pending} className="btn-danger btn-sm">
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {pending ? 'Deleting...' : 'Delete selected'}
          </button>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between text-xs text-ink-500">
        <span>
          Showing <strong className="text-ink-700">{filtered.length === 0 ? 0 : start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)}</strong> of <strong className="text-ink-700">{filtered.length}</strong>
          {filtered.length !== jobs.length && <span className="ml-1">(filtered from {jobs.length})</span>}
        </span>
        <span>Page {page} of {totalPages}</span>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto scroll-thin">
          <table className="table w-full table-fixed">
            <colgroup>
              <col className="w-10" />
              <col />
              <col className="w-[140px]" />
              <col className="w-[100px]" />
              <col className="w-[110px]" />
              <col className="w-[90px]" />
              <col className="w-[110px]" />
              <col className="w-[220px]" />
            </colgroup>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={allPageChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = indeterminate;
                    }}
                    onChange={(e) => togglePageAll(e.target.checked)}
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
              {pageJobs.map((j) => {
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
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center text-xs font-semibold flex-shrink-0 mt-0.5">
                          {initials(j.company)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-ink-900 text-sm leading-snug line-clamp-2 break-words" title={j.title}>{j.title}</p>
                          <p className="mt-0.5 text-xs text-ink-500 truncate">
                            {j.company} · {j.city}
                            {j.entryLevelFriendly && <span className="ml-2 badge-accent text-[10px]">Entry</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="align-top">
                      {c && <span className="badge-brand text-[11px] whitespace-normal leading-tight inline-block">{c.title}</span>}
                    </td>
                    <td className="text-sm text-ink-600 whitespace-nowrap align-top">{j.type}</td>
                    <td className="text-sm text-ink-600 whitespace-nowrap align-top">{j.seniority}</td>
                    <td className="text-sm text-ink-600 whitespace-nowrap align-top">{formatDate(j.postedAt)}</td>
                    <td className="text-sm whitespace-nowrap align-top">
                      <span className={isJobDeadlinePassed(j) ? 'text-rose-600 font-medium' : 'text-ink-600'}>
                        {j.deadline ? formatDate(j.deadline) : '—'}
                      </span>
                      {isJobDeadlinePassed(j) && <span className="ml-1 badge-danger text-[10px]">Past</span>}
                    </td>
                    <td className="align-top">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/jobs/${j.id}/applicants`} className="btn-ghost btn-sm !px-2">Apps</Link>
                        <Link href={`/admin/jobs/${j.id}/edit`} className="btn-ghost btn-sm !px-2">Edit</Link>
                        <DeleteJobButton id={j.id} title={j.title} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-sm text-ink-500">
                {jobs.length === 0
                  ? <>No jobs posted yet. Click <strong className="text-ink-700">Post a role</strong> to add the first one.</>
                  : <>No jobs match your filters.</>}
              </p>
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
    </>
  );
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  const pages = buildPageList(page, totalPages);
  return (
    <nav className="mt-6 flex items-center justify-center gap-1.5 flex-wrap" aria-label="Pagination">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="btn-ghost btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" /> Prev
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-2 text-ink-400 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={
              p === page
                ? 'min-w-[36px] h-9 rounded-lg bg-brand-600 text-white text-sm font-semibold'
                : 'min-w-[36px] h-9 rounded-lg bg-white border border-ink-200 text-ink-700 hover:bg-ink-50 text-sm font-medium'
            }
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="btn-ghost btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}

function buildPageList(page: number, totalPages: number): Array<number | '…'> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: Array<number | '…'> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push('…');
  pages.push(totalPages);
  return pages;
}
