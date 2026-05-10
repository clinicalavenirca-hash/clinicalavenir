'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { applyToJob } from '@/app/actions/jobApplications';
import { toast } from '@/components/ui/Toast';

export function ApplyButton({ jobId, alreadyApplied = false }: { jobId: string; alreadyApplied?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(alreadyApplied);

  function onClick() {
    startTransition(async () => {
      const res = await applyToJob(jobId);
      if (res?.error) { toast(res.error, 'error'); return; }
      setDone(true);
      toast('Application sent. Tracker updated.', 'success');
      router.refresh();
    });
  }

  if (done) {
    return (
      <button disabled className="btn-secondary btn-lg w-full justify-center !text-emerald-700 !border-emerald-200 !bg-emerald-50">
        <Check className="w-5 h-5" strokeWidth={2.5} />
        Application sent
      </button>
    );
  }

  return (
    <button onClick={onClick} disabled={pending} className="btn-primary btn-lg w-full justify-center">
      {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" strokeWidth={2.5} />}
      {pending ? 'Applying…' : 'Apply with my resume'}
    </button>
  );
}
