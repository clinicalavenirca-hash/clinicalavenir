'use client';
import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, Check, AlertCircle, FileSpreadsheet } from 'lucide-react';
import type { Course } from '@/lib/data';
import { toast } from '@/components/ui/Toast';
import { bulkImportJobs, type BulkJobRow } from '@/app/actions/jobs';
import { cn } from '@/lib/utils';

type Row = BulkJobRow & {
  /** Per-row include checkbox in the preview table. */
  include: boolean;
  /** Raw "Location" string from the scraper — kept for display. */
  rawLocation: string;
};

/**
 * Bulk-import dialog. Admin drops the .xlsx the Indeed-scraper extension
 * spits out, we parse it client-side via dynamic-imported xlsx, render a
 * preview table, then call bulkImportJobs() to insert in one shot.
 *
 * Every imported row becomes an external-apply job (apply_url is set), so
 * the public job detail page redirects students to Indeed instead of
 * showing the internal apply flow — matching the existing apply_url path.
 */
export function BulkImportJobsModal({ courses }: { courses: Course[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [parsing, setParsing] = useState(false);

  const [courseSlug, setCourseSlug] = useState(courses[0]?.slug ?? '');
  const [defaultCountry, setDefaultCountry] = useState('Canada');
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState('');

  function close() {
    setOpen(false);
    setRows([]);
    setError('');
  }

  async function onFile(file: File | null | undefined) {
    if (!file) return;
    setError('');
    setRows([]);
    setParsing(true);
    try {
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      if (!sheet) {
        setError('That file has no sheets.');
        return;
      }
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

      // Header detection — scraper uses these exact labels.
      const parsed: Row[] = json.map((r) => {
        const title = String(r['Position Name'] ?? '').trim();
        const company = String(r['Company'] ?? '').trim();
        const location = String(r['Location'] ?? '').trim();
        const url = String(r['URL'] ?? '').trim();
        const externalLink = String(r['External Apply Link'] ?? '').trim();
        const postedAtRaw = r['Posted At'];

        // Apply URL: prefer the direct external link, fall back to the
        // indeed.com listing URL — both make the job an external-apply role.
        const applyUrl = externalLink || url;

        // Parse "Toronto, ON" / "Remote" / "Hybrid worker" into city/country.
        let city = '';
        let country = defaultCountry;
        if (location) {
          if (/^remote$/i.test(location)) {
            city = 'Remote';
          } else if (/^hybrid/i.test(location)) {
            city = 'Hybrid';
          } else {
            const parts = location.split(',').map((s) => s.trim()).filter(Boolean);
            city = parts[0] ?? '';
            if (parts[1]) country = parts[1];
          }
        }

        const postedAt =
          postedAtRaw instanceof Date
            ? postedAtRaw.toISOString()
            : (typeof postedAtRaw === 'string' && postedAtRaw.trim()) ? postedAtRaw.trim() : null;

        return {
          include: Boolean(title && company && applyUrl),
          title,
          company,
          city,
          country,
          rawLocation: location,
          applyUrl,
          postedAt
        };
      });

      if (parsed.length === 0) {
        setError('No rows found in the first sheet.');
        return;
      }
      // Warn if header columns weren't recognized
      const usable = parsed.filter((r) => r.title && r.company && r.applyUrl).length;
      if (usable === 0) {
        setError(
          "Couldn't read any usable rows. Make sure the headers are: Position Name, Company, Location, URL, External Apply Link, Posted At."
        );
        return;
      }
      setRows(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse the file.');
    } finally {
      setParsing(false);
    }
  }

  function toggleAll(checked: boolean) {
    setRows((prev) => prev.map((r) => ({ ...r, include: checked })));
  }

  function toggleRow(i: number, checked: boolean) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, include: checked } : r)));
  }

  function submit() {
    setError('');
    const toSend = rows.filter((r) => r.include);
    if (toSend.length === 0) { setError('Tick at least one row.'); return; }
    if (!courseSlug) { setError('Pick a course track.'); return; }

    startTransition(async () => {
      const res = await bulkImportJobs({
        courseSlug,
        rows: toSend.map(({ title, company, city, country, applyUrl, postedAt }) => ({
          title, company, city, country, applyUrl, postedAt
        }))
      });
      if (res?.error) { setError(res.error); return; }
      const ins = res.inserted ?? 0;
      const skip = res.skipped ?? 0;
      toast(
        skip > 0
          ? `Imported ${ins} jobs — skipped ${skip} duplicates.`
          : `Imported ${ins} job${ins === 1 ? '' : 's'}.`,
        'success'
      );
      close();
    });
  }

  const selectedCount = rows.filter((r) => r.include).length;
  const allChecked = rows.length > 0 && selectedCount === rows.length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-secondary btn-md"
      >
        <Upload className="w-4 h-4" strokeWidth={2.2} />
        Bulk import
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Scrim */}
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-50 bg-ink-950/50"
              onClick={close}
            />
            {/* Dialog */}
            <motion.div
              key="dialog"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-3 top-6 bottom-6 sm:inset-x-12 lg:inset-x-24 xl:inset-x-48 z-50 bg-white rounded-2xl shadow-soft-xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-ink-100">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-ink-500">
                    Bulk import
                  </p>
                  <h2 className="mt-0.5 text-xl font-display font-bold">
                    Indeed scraper → Jobs board
                  </h2>
                  <p className="mt-1 text-xs text-ink-500">
                    Drop the .xlsx the extension exports. Duplicates (by URL) are skipped automatically.
                  </p>
                </div>
                <button onClick={close} className="text-ink-500 hover:text-ink-950 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                {/* Batch defaults */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Course track *</label>
                    <select
                      className="input"
                      value={courseSlug}
                      onChange={(e) => setCourseSlug(e.target.value)}
                    >
                      {courses.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.title}</option>
                      ))}
                    </select>
                    <p className="helper">Applies to every imported job. Edit individual jobs later if needed.</p>
                  </div>
                  <div>
                    <label className="label">Default country</label>
                    <input
                      className="input"
                      value={defaultCountry}
                      onChange={(e) => setDefaultCountry(e.target.value)}
                      placeholder="Canada"
                    />
                    <p className="helper">Used when the scraped location doesn&apos;t include one (e.g. &quot;Remote&quot;).</p>
                  </div>
                </div>

                {/* File picker */}
                {rows.length === 0 && (
                  <label
                    className={cn(
                      'block rounded-2xl border-2 border-dashed border-ink-200 px-6 py-12 text-center cursor-pointer transition-colors',
                      parsing
                        ? 'opacity-50 cursor-wait'
                        : 'hover:border-ink-950 hover:bg-brand-50/40'
                    )}
                  >
                    <FileSpreadsheet className="w-10 h-10 mx-auto text-ink-300" strokeWidth={1.6} />
                    <p className="mt-4 font-semibold text-ink-950">
                      {parsing ? 'Reading file…' : 'Choose an .xlsx or .csv file'}
                    </p>
                    <p className="mt-1 text-xs text-ink-500">
                      Expected headers: Position Name, Company, Location, URL, External Apply Link, Posted At
                    </p>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      className="sr-only"
                      onChange={(e) => onFile(e.target.files?.[0])}
                      disabled={parsing}
                    />
                  </label>
                )}

                {/* Preview table */}
                {rows.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                      <p className="text-sm text-ink-700">
                        <span className="font-semibold text-ink-950">{selectedCount}</span> of{' '}
                        {rows.length} rows selected for import.
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleAll(true)}
                          className="text-xs font-semibold text-ink-700 hover:text-ink-950"
                        >
                          Select all
                        </button>
                        <span className="text-ink-300">·</span>
                        <button
                          type="button"
                          onClick={() => toggleAll(false)}
                          className="text-xs font-semibold text-ink-700 hover:text-ink-950"
                        >
                          Deselect all
                        </button>
                        <span className="text-ink-300">·</span>
                        <button
                          type="button"
                          onClick={() => { setRows([]); setError(''); }}
                          className="text-xs font-semibold text-ink-700 hover:text-rose-600"
                        >
                          Re-upload
                        </button>
                      </div>
                    </div>
                    <div className="rounded-xl border border-ink-200 overflow-hidden">
                      <div className="overflow-x-auto max-h-[40vh] overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-ink-50 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left w-10">
                                <input
                                  type="checkbox"
                                  checked={allChecked}
                                  onChange={(e) => toggleAll(e.target.checked)}
                                  className="rounded text-brand-600 focus:ring-brand-500"
                                />
                              </th>
                              <th className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] font-semibold text-ink-500">Title</th>
                              <th className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] font-semibold text-ink-500">Company</th>
                              <th className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] font-semibold text-ink-500">Location</th>
                              <th className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] font-semibold text-ink-500">Posted</th>
                              <th className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] font-semibold text-ink-500">Link</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((r, i) => {
                              const valid = Boolean(r.title && r.company && r.applyUrl);
                              return (
                                <tr
                                  key={i}
                                  className={cn(
                                    'border-t border-ink-100',
                                    !valid && 'bg-rose-50/30'
                                  )}
                                >
                                  <td className="px-3 py-2 align-top">
                                    <input
                                      type="checkbox"
                                      checked={r.include}
                                      disabled={!valid}
                                      onChange={(e) => toggleRow(i, e.target.checked)}
                                      className="rounded text-brand-600 focus:ring-brand-500 disabled:opacity-50"
                                    />
                                  </td>
                                  <td className="px-3 py-2 align-top">
                                    <span className="font-medium text-ink-950">{r.title || <em className="text-rose-500">missing</em>}</span>
                                  </td>
                                  <td className="px-3 py-2 align-top text-ink-700">
                                    {r.company || <em className="text-rose-500">missing</em>}
                                  </td>
                                  <td className="px-3 py-2 align-top text-ink-700">
                                    {r.rawLocation || '—'}
                                  </td>
                                  <td className="px-3 py-2 align-top text-ink-500 text-xs whitespace-nowrap">
                                    {r.postedAt ? new Date(r.postedAt).toLocaleDateString('en-CA') : '—'}
                                  </td>
                                  <td className="px-3 py-2 align-top text-ink-500 text-xs">
                                    {r.applyUrl ? (
                                      <a href={r.applyUrl} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline truncate inline-block max-w-[18ch]">
                                        link
                                      </a>
                                    ) : <em className="text-rose-500">missing</em>}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-inset ring-rose-200 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={2.2} />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-ink-100 px-5 sm:px-6 py-4 flex items-center justify-end gap-3">
                <button type="button" onClick={close} className="btn-ghost btn-md">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={pending || rows.length === 0 || selectedCount === 0}
                  className="btn-primary btn-md"
                >
                  {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {pending ? 'Importing…' : `Import ${selectedCount} ${selectedCount === 1 ? 'job' : 'jobs'}`}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
