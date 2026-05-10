'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { toast } from '@/components/ui/Toast';
import { supabaseBrowser } from '@/lib/supabase/client';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/student/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = supabaseBrowser();
    if (!supabase) { toast('Supabase is not configured.', 'error'); return; }
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setBusy(false); toast(error.message, 'error'); return; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
    if (profile?.role === 'admin') {
      await supabase.auth.signOut();
      setBusy(false);
      toast('Use the admin portal to sign in.', 'warning');
      router.push('/admin-login');
      return;
    }
    toast('Signed in.', 'success');
    // Hard-nav so the new auth cookie is sent on the dashboard request and
    // middleware sees the fresh JWT immediately. router.push + router.refresh()
    // ran with cookie propagation on Windows and felt laggy.
    window.location.assign(next);
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.24 }} className="card card-pad sm:p-8">
        <span className="eyebrow">Student sign in</span>
        <h1 className="mt-2 text-2xl sm:text-3xl">Welcome back.</h1>
        <p className="mt-2 text-ink-600 text-sm">Sign in with the credentials you received from our admissions team.</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required autoComplete="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="label !mb-0" htmlFor="pwd">Password</label>
              <Link href="/forgot-password" className="text-xs font-medium text-brand-700 hover:text-brand-600">Forgot password?</Link>
            </div>
            <div className="mt-1.5">
              <PasswordInput id="pwd" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <button type="submit" disabled={busy} className="btn-primary btn-lg w-full justify-center">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Sign in
          </button>
        </form>
      </motion.div>
      <p className="mt-6 text-center text-sm text-ink-500">No account yet? <Link href="/apply" className="font-semibold text-ink-900">Apply for a course</Link></p>
    </>
  );
}
