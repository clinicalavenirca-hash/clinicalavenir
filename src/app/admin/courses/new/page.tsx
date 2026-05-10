import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CourseEditForm } from '@/components/admin/CourseEditForm';

export default function Page() {
  return (
    <>
      <div className="mb-4">
        <Link href="/admin/courses" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700">
          <ArrowLeft className="w-4 h-4" /> All courses
        </Link>
      </div>
      <div className="mb-6">
        <span className="eyebrow">Catalog</span>
        <h1 className="mt-2 text-2xl sm:text-3xl">New course</h1>
        <p className="mt-1 text-ink-600">Title and slug are required. Cover photo is optional but recommended.</p>
      </div>
      <CourseEditForm course={null} />
    </>
  );
}
