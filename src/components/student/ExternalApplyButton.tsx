'use client';
import { useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { applyToJobExternal } from '@/app/actions/jobApplications';
import { toast } from '@/components/ui/Toast';

export function ExternalApplyButton({ jobId, redirectUrl }: { jobId: string; redirectUrl?: string | null }) {
  const [pending, setPending] = useState(false);

  async function handleApply() {
    setPending(true);
    try {
      const res = await applyToJobExternal(jobId);
      if (res?.error) {
        toast(res.error, 'error');
        setPending(false);
        return;
      }
      
      toast('Application tracked. Opening company site...', 'success');
      
      const urlToOpen = res?.redirectUrl || redirectUrl;
      if (urlToOpen) {
        // Ensure URL has protocol
        let finalUrl = urlToOpen;
        if (!finalUrl.match(/^https?:\/\//i)) {
          finalUrl = 'https://' + finalUrl;
        }
        // Use a small delay to ensure the tracking completes
        setTimeout(() => {
          window.open(finalUrl, '_blank', 'noopener,noreferrer');
          setPending(false);
        }, 200);
      } else {
        toast('No external link found.', 'error');
        setPending(false);
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Something went wrong', 'error');
      setPending(false);
    }
  }

  return (
    <button onClick={handleApply} disabled={pending} className="btn-primary btn-lg w-full justify-center">
      {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <ExternalLink className="w-5 h-5" />}
      {pending ? 'Tracking & opening...' : 'Apply on company site'}
    </button>
  );
}
