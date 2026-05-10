'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Copy, Check } from 'lucide-react';
import { setStudentStatus, deleteStudent, resetStudentPassword, addCourseToStudent, removeCourseFromStudent } from '@/app/actions/students';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

export function ToggleStudentStatusButton({ id, current }: { id: string; current: 'active' | 'inactive' }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const next = current === 'active' ? 'inactive' : 'active';
  const label = current === 'active' ? 'Deactivate account' : 'Reactivate';
  function onClick() {
    startTransition(async () => {
      const res = await setStudentStatus(id, next);
      if (res?.error) { toast(res.error, 'error'); return; }
      toast(next === 'active' ? 'Account reactivated.' : 'Account deactivated.', 'info');
      router.refresh();
    });
  }
  return (
    <button onClick={onClick} disabled={pending} className={cn(
      'btn-secondary btn-sm w-full',
      current === 'active' ? '!border-amber-200 !text-amber-700 hover:!bg-amber-50' : '!border-emerald-200 !text-emerald-700 hover:!bg-emerald-50'
    )}>
      {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
      {label}
    </button>
  );
}

export function DeleteStudentButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function onClick() {
    if (!confirm(`Permanently delete ${name}'s account? This removes their auth user, profile, enrollments, progress, and job applications. Cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteStudent(id);
      if (res?.error) { toast(res.error, 'error'); return; }
      toast('Account deleted.', 'info');
      router.push('/admin/students');
      router.refresh();
    });
  }
  return (
    <button onClick={onClick} disabled={pending} className="btn-danger btn-sm w-full">
      {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
      Delete account
    </button>
  );
}

export function ResetPasswordCard({ id }: { id: string }) {
  const [pw, setPw] = useState('');
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function reset() {
    startTransition(async () => {
      const res = await resetStudentPassword(id);
      if (res?.error) { toast(res.error, 'error'); return; }
      setPw(res.tempPassword!);
      toast('Temporary password generated. Copy and send to the student.', 'success');
    });
  }
  function copy() {
    navigator.clipboard.writeText(pw).then(() => {
      setCopied(true);
      toast('Password copied to clipboard.', 'info');
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="card card-pad">
      <p className="eyebrow">Reset password</p>
      <p className="mt-1 text-sm text-ink-600">Generate a temporary password for this student. The new password is shown once — copy it and send through your preferred channel.</p>
      <div className="mt-4 flex gap-3">
        <input value={pw} placeholder="Click 'Generate' to create…" readOnly className="input flex-1 font-mono" />
        {pw ? (
          <button onClick={copy} className="btn-secondary btn-md">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        ) : (
          <button onClick={reset} disabled={pending} className="btn-primary btn-md">
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            Generate
          </button>
        )}
      </div>
    </div>
  );
}

export function StudentCourseRow({ userId, courseId, courseTitle }: { userId: string; courseId: string; courseTitle: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function remove() {
    if (!confirm(`Remove ${courseTitle} from this student?`)) return;
    startTransition(async () => {
      const res = await removeCourseFromStudent(userId, courseId);
      if (res?.error) { toast(res.error, 'error'); return; }
      toast('Course removed.', 'info');
      router.refresh();
    });
  }
  return (
    <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-ink-50">
      <p className="text-sm font-medium text-ink-800">{courseTitle}</p>
      <button onClick={remove} disabled={pending} className="text-xs text-rose-600 font-medium hover:underline">
        {pending ? 'Removing…' : 'Remove'}
      </button>
    </div>
  );
}

export function AddCourseControl({ userId, available }: { userId: string; available: { id: string; title: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  function add(courseId: string) {
    startTransition(async () => {
      const res = await addCourseToStudent(userId, courseId);
      if (res?.error) { toast(res.error, 'error'); return; }
      setOpen(false);
      toast('Course added.', 'success');
      router.refresh();
    });
  }
  if (available.length === 0) return null;
  return (
    <>
      <button onClick={() => setOpen((o) => !o)} className="mt-4 btn-ghost btn-sm w-full text-brand-700 hover:bg-brand-50">+ Add another course</button>
      {open && (
        <div className="mt-2 space-y-1.5">
          {available.map((c) => (
            <button key={c.id} disabled={pending} onClick={() => add(c.id)} className="w-full px-3 py-2 text-left text-sm rounded-lg bg-white border border-ink-200 hover:border-brand-400 hover:bg-brand-50/40">
              {c.title}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
