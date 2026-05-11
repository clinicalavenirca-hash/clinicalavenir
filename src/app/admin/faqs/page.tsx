import { fetchFaqs } from '@/lib/db/faqs';
import { FaqsAdmin } from '@/components/admin/FaqsAdmin';

export const dynamic = 'force-dynamic';

export default async function FaqsAdminPage() {
  const faqs = await fetchFaqs();
  return (
    <>
      <div className="mb-6">
        <span className="eyebrow">Content</span>
        <h1 className="mt-2 text-2xl sm:text-3xl">FAQs</h1>
        <p className="mt-1 text-ink-600">
          These appear on the public FAQ page, the Programs page bottom, and the
          first four are shown on every course detail page. Lower order = earlier
          in the list.
        </p>
      </div>
      <FaqsAdmin initial={faqs} />
    </>
  );
}
