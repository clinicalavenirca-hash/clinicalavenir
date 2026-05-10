'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import { deleteCourse } from '@/app/actions/courses';
import { toast } from '@/components/ui/Toast';

export function DeleteCourseButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function onClick() {
    if (!confirm(`Delete "${title}"? This removes its modules, videos, and student access.`)) return;
    startTransition(async () => {
      const res = await deleteCourse(id);
      if (res?.error) { toast(res.error, 'error'); return; }
      toast('Course deleted.', 'success');
      router.refresh();
    });
  }
  return (
    <button onClick={onClick} disabled={pending} className="btn-ghost btn-sm justify-center text-rose-600 hover:bg-rose-50">
      {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      Delete
    </button>
  );
}
