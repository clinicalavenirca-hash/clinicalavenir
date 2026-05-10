'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import { deleteJob } from '@/app/actions/jobs';
import { toast } from '@/components/ui/Toast';

export function DeleteJobButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function onClick() {
    if (!confirm(`Delete "${title}"? Applicant history for this role will also be removed.`)) return;
    startTransition(async () => {
      const res = await deleteJob(id);
      if (res?.error) { toast(res.error, 'error'); return; }
      toast('Role deleted.', 'success');
      router.refresh();
    });
  }
  return (
    <button onClick={onClick} disabled={pending} className="p-1.5 rounded hover:bg-rose-50 text-ink-400 hover:text-rose-600">
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
