/**
 * Skeleton shown while the admin server component is rendering. Without this,
 * Next.js renders a blank screen during the (fully-dynamic) page transition,
 * which felt like the app was frozen.
 */
export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="h-3 w-16 rounded bg-ink-200" />
          <div className="h-9 w-64 rounded-lg bg-ink-200 mt-3" />
          <div className="h-4 w-80 rounded bg-ink-100 mt-2" />
        </div>
        <div className="h-9 w-28 rounded-full bg-emerald-100" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card card-pad">
            <div className="h-3 w-24 rounded bg-ink-100" />
            <div className="h-8 w-20 rounded bg-ink-200 mt-3" />
            <div className="h-3 w-32 rounded bg-ink-100 mt-2" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 card card-pad space-y-3">
          <div className="h-5 w-40 rounded bg-ink-200 mb-3" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-ink-100" />
          ))}
        </div>
        <div className="lg:col-span-5 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card card-pad h-24 bg-ink-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
