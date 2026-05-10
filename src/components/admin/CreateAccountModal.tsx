'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, Loader2, RefreshCw, X, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { createAccountFromApplication } from '@/app/actions/applications';
import type { Application } from '@/lib/data';

type Props = {
  application: Application;
  onClose: () => void;
};

function generatePassword(length = 14) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghjkmnpqrstuvwxyz';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function CreateAccountModal({ application, onClose }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState<{ email: string; password: string } | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast('Password must be at least 8 characters.', 'warning'); return; }
    startTransition(async () => {
      const res = await createAccountFromApplication(application.id, password);
      if (res?.error) { toast(res.error, 'error'); return; }
      setDone({ email: res.email!, password: res.password! });
      router.refresh();
    });
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-ink-900/50 grid place-items-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="card card-pad max-w-md w-full"
        >
          {!done ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="eyebrow">Create student account</span>
                  <h3 className="mt-1 text-lg font-display font-bold">{application.studentName}</h3>
                  <p className="text-sm text-ink-500 break-all">{application.email}</p>
                </div>
                <button onClick={onClose} className="p-1 rounded hover:bg-ink-100 text-ink-400"><X className="w-5 h-5" /></button>
              </div>

              <p className="mt-4 text-sm text-ink-600">
                Set a password for this student. They'll sign in at <strong>/login</strong> with the email above and this password —
                you'll send these credentials to them via WhatsApp or phone.
              </p>

              <form onSubmit={submit} className="mt-5 space-y-4">
                <div>
                  <label className="label">Password (min 8 characters) *</label>
                  <div className="relative">
                    <input
                      type={show ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input pr-20 font-mono"
                      placeholder="Type or generate"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center gap-0.5 pr-1">
                      <button type="button" onClick={() => setShow((s) => !s)} className="p-2 text-ink-400 hover:text-ink-700" aria-label={show ? 'Hide password' : 'Show password'}>
                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button type="button" onClick={() => setPassword(generatePassword())} className="p-2 text-ink-400 hover:text-brand-700" aria-label="Generate strong password" title="Generate strong password">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="helper">Click the refresh icon to fill with a strong random password.</p>
                </div>

                <div className="rounded-xl bg-ink-50 p-3 text-xs text-ink-600">
                  After creating, the student will be enrolled in <strong className="text-ink-900">{application.courses.length} course{application.courses.length === 1 ? '' : 's'}</strong>:
                  <ul className="mt-1.5 list-disc pl-5 space-y-0.5">
                    {application.courses.map((s) => <li key={s}>{s}</li>)}
                  </ul>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-ink-100">
                  <button type="button" onClick={onClose} className="btn-secondary btn-md">Cancel</button>
                  <button type="submit" disabled={pending || password.length < 8} className="btn-primary btn-md">
                    {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" strokeWidth={2.5} />}
                    {pending ? 'Creating…' : 'Create account'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center"><Check className="w-6 h-6" strokeWidth={2.5} /></div>
              <h3 className="mt-4 text-lg font-display font-bold">Account created</h3>
              <p className="mt-1 text-sm text-ink-600">Send these credentials to <strong className="text-ink-900">{application.studentName}</strong>. The password is shown <strong>only once</strong> — copy it now.</p>
              <div className="mt-4 space-y-2">
                <CopyRow label="Email" value={done.email} />
                <CopyRow label="Password" value={done.password} mono />
              </div>
              <SendOnWhatsApp
                phone={(application.countryCode + application.phone).replace(/\D/g, '')}
                firstName={application.studentName.split(' ')[0]}
                email={done.email}
                password={done.password}
              />
              <button onClick={onClose} className="mt-3 btn-secondary btn-md w-full justify-center">I&apos;ve sent them — close</button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Opens wa.me with a pre-filled message containing the student's freshly
 * minted credentials. Phone is digits only (no `+`, no spaces) per wa.me's
 * format. The window is opened with target=_blank so the modal stays put.
 */
function SendOnWhatsApp({ phone, firstName, email, password }: { phone: string; firstName: string; email: string; password: string }) {
  // Plain-text body — newlines become %0A. WhatsApp renders line breaks as-is.
  const body =
    `Hi ${firstName},%0A%0A` +
    `Your Avenir student account is ready. Sign in here:%0A` +
    `${typeof window !== 'undefined' ? window.location.origin : ''}/login%0A%0A` +
    `Email: ${encodeURIComponent(email)}%0A` +
    `Password: ${encodeURIComponent(password)}%0A%0A` +
    `Welcome aboard!%0A— Avenir Admissions`;
  const href = `https://wa.me/${phone}?text=${body}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-5 inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-[#25D366] text-white font-semibold text-sm hover:bg-[#1ebe57] transition-colors shadow-soft"
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.71.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.436-9.884 9.888-9.884a9.825 9.825 0 0 1 6.991 2.898 9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
      </svg>
      Send on WhatsApp
    </a>
  );
}

function CopyRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-ink-500 w-16">{label}</span>
      <input readOnly value={value} className={cn('input flex-1 !py-2 !text-sm', mono && 'font-mono')} />
      <button onClick={copy} className="btn-secondary btn-sm">
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
