import { Loader2 } from 'lucide-react';

/**
 * Shown while any admin route's server component is fetching its data.
 * A centered spinner reads as "working on it" more clearly than a
 * static skeleton, which earlier looked like a blank panel.
 */
export default function AdminLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-10 h-10 text-brand-600 animate-spin" strokeWidth={2.2} />
      <p className="text-sm text-ink-500">Loading…</p>
    </div>
  );
}
