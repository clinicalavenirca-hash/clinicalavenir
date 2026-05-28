'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, FileText, Loader2 } from 'lucide-react';
import type { JobApplication } from '@/lib/data';
import { cn, initials, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { updateJobApplicantStatus } from '@/app/actions/jobs';
import { getApplicantResume } from '@/app/actions/resumes';
import { ResumeViewerModal } from './ResumeViewerModal';

const COLS = [
  { id: 'applied',   label: 'Applied',   stripe: 'bg-ink-300' },
  { id: 'interview', label: 'Interview', stripe: 'bg-brand-500' },
  { id: 'offer',     label: 'Offer',     stripe: 'bg-emerald-500' },
  { id: 'rejected',  label: 'Rejected',  stripe: 'bg-rose-500' }
] as const;

type Status = JobApplication['status'];

export function ApplicantsBoard({ initial }: { initial: JobApplication[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [resumeOpen, setResumeOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const [resumeLoading, setResumeLoading] = useState(false);

  function move(id: string, status: Status) {
    startTransition(async () => {
      const res = await updateJobApplicantStatus(id, status);
      if (res?.error) { toast(res.error, 'error'); return; }
      const msg = status === 'offer' ? 'Applicant moved to Offer.' :
                  status === 'rejected' ? 'Applicant marked Rejected.' :
                  `Moved to ${status}.`;
      toast(msg, 'success');
      router.refresh();
    });
  }

  async function handleViewResume(applicationId: string, studentName: string) {
    setSelectedApplicationId(applicationId);
    setResumeLoading(true);
    try {
      const result = await getApplicantResume(applicationId);
      if (result.error) {
        toast(result.error, 'error');
        return;
      }
      setResumeData({
        resume: result.resume || {},
        pdfName: result.pdfName,
        fullName: result.fullName || studentName,
        placeholder: result.placeholder
      });
      setResumeOpen(true);
    } catch (err) {
      toast('Failed to load resume', 'error');
    } finally {
      setResumeLoading(false);
    }
  }

  return (
    <>
      <div className="grid grid-flow-col auto-cols-[88%] sm:auto-cols-[60%] lg:grid-cols-4 lg:auto-cols-auto overflow-x-auto sm:overflow-visible gap-4 pb-4 scroll-thin snap-x snap-mandatory sm:snap-none">
        {COLS.map((col) => {
          const items = initial.filter((a) => a.status === col.id);
          return (
            <div key={col.id} className="kanban-col snap-start">
              <div className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-2">
                  <span className={cn('w-2 h-2 rounded-full', col.stripe)} />
                  <h3 className="font-semibold text-ink-900">{col.label}</h3>
                  <span className="text-xs text-ink-500">({items.length})</span>
                </div>
              </div>
              <div className="space-y-2.5 min-h-[60px]">
                <AnimatePresence>
                  {items.map((a) => (
                    <motion.article key={a.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="kanban-card">
                      <div className="flex items-start gap-3">
                        <span className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center text-xs font-semibold flex-shrink-0">{initials(a.studentName || '?')}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-ink-900 text-sm truncate">{a.studentName}</p>
                          <p className="text-xs text-ink-500 truncate">{a.email}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-ink-500">
                        <Calendar className="w-3.5 h-3.5" /> Applied {formatDate(a.appliedAt)}
                      </div>
                      <div className="mt-3 pt-3 border-t border-ink-100 flex items-center justify-between flex-wrap gap-2">
                        <button 
                          disabled={resumeLoading}
                          onClick={() => handleViewResume(a.id, a.studentName)}
                          className="text-xs font-semibold text-brand-700 hover:text-brand-600 inline-flex items-center gap-1 disabled:opacity-50"
                        >
                          {resumeLoading && selectedApplicationId === a.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <FileText className="w-3.5 h-3.5" />
                          )}
                          Resume
                        </button>
                        <div className="flex gap-1">
                          {col.id === 'applied' && <button disabled={pending} onClick={() => move(a.id, 'interview')} className="btn-primary btn-sm !py-1 !px-2 text-[11px]">{pending && <Loader2 className="w-3 h-3 animate-spin" />}Move to interview</button>}
                          {col.id === 'interview' && (<>
                            <button disabled={pending} onClick={() => move(a.id, 'offer')} className="btn-ghost btn-sm !py-1 !px-2 text-[11px] text-emerald-700 hover:bg-emerald-50">Offer</button>
                            <button disabled={pending} onClick={() => move(a.id, 'rejected')} className="btn-ghost btn-sm !py-1 !px-2 text-[11px] text-rose-700 hover:bg-rose-50">Reject</button>
                          </>)}
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
                {items.length === 0 && (
                  <div className="border-2 border-dashed border-ink-200 rounded-xl p-6 text-center">
                    <p className="text-xs text-ink-400">No applicants in this stage</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ResumeViewerModal
        isOpen={resumeOpen}
        onClose={() => {
          setResumeOpen(false);
          setResumeData(null);
          setSelectedApplicationId(null);
        }}
        resume={resumeData?.resume || null}
        pdfName={resumeData?.pdfName}
        fullName={resumeData?.fullName}
        placeholder={resumeData?.placeholder}
      />
    </>
  );
}
