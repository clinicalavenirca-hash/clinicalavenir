import { fetchStories } from '@/lib/db/stories';
import { StoriesAdmin } from '@/components/admin/StoriesAdmin';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const stories = await fetchStories();
  return (
    <>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <span className="eyebrow">Marketing</span>
          <h1 className="mt-2 text-2xl sm:text-3xl">Stories</h1>
          <p className="mt-1 text-ink-600">
            Graduate testimonials shown on the public home page. Add a quote, the placement, and an optional photo.
          </p>
        </div>
      </div>
      <StoriesAdmin initial={stories} />
    </>
  );
}
