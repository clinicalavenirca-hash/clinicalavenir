'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Course, Job } from '@/lib/data';
import { initials, formatDate } from '@/lib/utils';

const PAGE_SIZE = 12;

const DATE_WINDOWS: Array<{ label: string; days: number | null }> = [
  { label: 'Any time', days: null },
  { label: 'Last 24 hours', days: 1 },
  { label: 'Last 3 days', days: 3 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 14 days', days: 14 }
];

export function JobsBoard({ jobs, courses }: { jobs: Job[]; courses: Course[] }) {
  const [q, setQ] = useState('');
  const [track, setTrack] = useState('');
  const [city, setCity] = useState('');
  const [seniority, setSeniority] = useState('');
  const [type, setType] = useState('');
  const [entry, setEntry] = useState(false);
  const [postedWithin, setPostedWithin] = useState<string>('');
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
        j.description.toLowerCase().includes(needle);
      const matchDate = cutoff === null || new Date(j.postedAt).getTime() >= cutoff;
      return (
        matchQ &&
        matchDate &&
        (!track || j.courseSlug === track) &&
        (!city || j.city === city) &&
        (!seniority || j.seniority === seniority) &&
        (!type || j.type === type) &&
        (!entry || j.entryLevelFriendly)
      );
    });
  }, [jobs, q, track, city, seniority, type, entry, postedWithin]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [q, track, city, seniority, type, entry, postedWithin]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const start = (page - 1) * PAGE_SIZE;
  const pageJobs = filtered.slice(start, start + PAGE_SIZE);

  return (
    <>
      <div className="card card-pad mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title, company, keyword…" className="input pl-9 !py-2.5 !text-sm" />
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
          <select value={city} onChange={(e) => setCity(e.target.value)} className="input !py-2.5 !text-sm">
            <option value="">All cities</option>
            <option>Toronto</option><option>Mississauga</option><option>Vancouver</option><option>Montréal</option>
          </select>
          <select value={seniority} onChange={(e) => setSeniority(e.target.value)} className="input !py-2.5 !text-sm">
            <option value="">All levels</option>
            <option>Entry-level</option><option>Mid-level</option><option>Senior</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={entry} onChange={(e) => setEntry(e.target.checked)} className="rounded text-brand-600 focus:ring-brand-500" />
            <span className="text-ink-700">Entry-level friendly only</span>
          </label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="input !py-2 !text-xs max-w-[180px]">
            <option value="">All types</option>
            <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
          </select>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between text-xs text-ink-500">
        <span>
          Showing <strong className="text-ink-700">{filtered.length === 0 ? 0 : start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)}</strong> of <strong className="text-ink-700">{filtered.length}</strong>
        </span>
        <span>Page {page} of {totalPages}</span>
      </div>

      <div className="space-y-3">
        {pageJobs.map((j) => {
          const c = courses.find((c) => c.slug === j.courseSlug);
          return (
            <Link key={j.id} href={`/student/jobs/${j.id}`} className="card card-hover p-5 sm:p-6 flex items-start gap-4 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center flex-shrink-0 font-display font-bold text-lg">
                {initials(j.company)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-display font-bold text-ink-900 truncate">{j.title}</h3>
                      {j.entryLevelFriendly && <span className="badge-accent text-[10px]">Entry-level friendly</span>}
                      {j.applyUrl && <span className="badge-ink text-[10px]">External apply</span>}
                    </div>
                    <p className="mt-0.5 text-sm text-ink-600">{j.company} · {j.city}, {j.country}</p>
                  </div>
                  <span className="text-xs text-ink-500 flex-shrink-0">Posted {formatDate(j.postedAt)}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {c && <span className="badge-brand">{c.title}</span>}
                  <span className="badge-ink">{j.type}</span>
                  <span className="badge-ink">{j.seniority}</span>
                  <span className="badge-ink">{j.salary}</span>
                </div>
                <p className="mt-3 text-sm text-ink-600 line-clamp-1">{j.description}</p>
              </div>
              <span className="hidden sm:inline-flex w-9 h-9 rounded-full bg-ink-50 text-ink-600 group-hover:bg-brand-600 group-hover:text-white items-center justify-center transition-colors flex-shrink-0">
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          );
        })}

        {filtered.length === 0 && (
          <div className="card card-pad text-center py-16">
            <Briefcase className="w-12 h-12 mx-auto text-ink-300" strokeWidth={1.5} />
            <h3 className="mt-4 text-lg">No matching roles right now.</h3>
            <p className="mt-1 text-sm text-ink-500">Try clearing filters or check back soon — we refresh listings weekly.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}
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
