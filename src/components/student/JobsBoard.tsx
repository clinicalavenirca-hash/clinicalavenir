'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, Briefcase } from 'lucide-react';
import type { Course, Job } from '@/lib/data';
import { initials, formatDate } from '@/lib/utils';

export function JobsBoard({ jobs, courses }: { jobs: Job[]; courses: Course[] }) {
  const [q, setQ] = useState('');
  const [track, setTrack] = useState('');
  const [city, setCity] = useState('');
  const [seniority, setSeniority] = useState('');
  const [type, setType] = useState('');
  const [entry, setEntry] = useState(false);

  const filtered = jobs.filter(j => {
    const matchQ = q === '' ||
      j.title.toLowerCase().includes(q.toLowerCase()) ||
      j.company.toLowerCase().includes(q.toLowerCase()) ||
      j.description.toLowerCase().includes(q.toLowerCase());
    return matchQ
      && (!track || j.courseSlug === track)
      && (!city || j.city === city)
      && (!seniority || j.seniority === seniority)
      && (!type || j.type === type)
      && (!entry || j.entryLevelFriendly);
  });

  return (
    <>
      <div className="card card-pad mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Title, company, keyword…" className="input pl-9 !py-2.5 !text-sm" />
          </div>
          <select value={track} onChange={e => setTrack(e.target.value)} className="input !py-2.5 !text-sm">
            <option value="">All tracks</option>
            {courses.map(c => <option key={c.slug} value={c.slug}>{c.title}</option>)}
          </select>
          <select value={city} onChange={e => setCity(e.target.value)} className="input !py-2.5 !text-sm">
            <option value="">All cities</option>
            <option>Toronto</option><option>Mississauga</option><option>Vancouver</option><option>Montréal</option>
          </select>
          <select value={seniority} onChange={e => setSeniority(e.target.value)} className="input !py-2.5 !text-sm">
            <option value="">All levels</option>
            <option>Entry-level</option><option>Mid-level</option><option>Senior</option>
          </select>
          <select value={type} onChange={e => setType(e.target.value)} className="input !py-2.5 !text-sm">
            <option value="">All types</option>
            <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
          </select>
        </div>
        <label className="mt-3 inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={entry} onChange={e => setEntry(e.target.checked)} className="rounded text-brand-600 focus:ring-brand-500" />
          <span className="text-ink-700">Entry-level friendly only</span>
        </label>
      </div>

      <div className="space-y-3">
        {filtered.map(j => {
          const c = courses.find(c => c.slug === j.courseSlug);
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
    </>
  );
}
