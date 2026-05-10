/** Skeleton for any /student/* page transition. */
export default function StudentLoading() {
  return (
    <div className="animate-pulse">
      <div className="rounded-3xl bg-gradient-to-br from-brand-700/40 via-brand-600/40 to-brand-800/40 h-48" />
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="aspect-video bg-ink-200" />
            <div className="p-5 space-y-2">
              <div className="h-4 w-3/4 rounded bg-ink-200" />
              <div className="h-3 w-1/2 rounded bg-ink-100" />
              <div className="h-1.5 w-full rounded-full bg-ink-100 mt-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
