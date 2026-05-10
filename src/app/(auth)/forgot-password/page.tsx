'use client';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function ForgotPage() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = supabaseBrowser();
    if (!supabase) { toast('Supabase is not configured.', 'error'); return; }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    setBusy(false);
    if (error) { toast(error.message, 'error'); return; }
    setSent(true);
    toast('Reset link sent — check your inbox.', 'success');
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.24 }} className="card card-pad sm:p-8">
      <span className="eyebrow">Reset password</span>
      <h1 className="mt-2 text-2xl sm:text-3xl">Forgot your password?</h1>
      <p className="mt-2 text-ink-600 text-sm">Enter the email you use to sign in. We&apos;ll send you a secure link to set a new password.</p>

      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" required autoComplete="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button type="submit" disabled={busy} className="btn-primary btn-lg w-full justify-center">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Send reset link
            </button>
          </motion.form>
        ) : (
          <motion.div key="sent" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center py-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-700 grid place-items-center"><CheckCircle2 className="w-7 h-7" /></div>
            <h3 className="mt-4 text-lg">Check your inbox.</h3>
            <p className="mt-2 text-sm text-ink-600">If the email exists in our system, we&apos;ve sent a reset link. The link expires in 60 minutes.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-8 text-center text-xs text-ink-500"><Link href="/login" className="font-semibold text-brand-700">← Back to sign in</Link></p>
    </motion.div>
  );
}
