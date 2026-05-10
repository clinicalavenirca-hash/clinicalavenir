'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { toast } from '@/components/ui/Toast';
import { supabaseBrowser } from '@/lib/supabase/client';

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/admin/dashboard';
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
    if (profile?.role !== 'admin') {
      await supabase.auth.signOut();
      setBusy(false);
      toast('This portal is for admins only.', 'warning');
      router.push('/login');
      return;
    }
    toast('Signed in.', 'success');
    // Hard-nav so the JWT picked up by middleware is the fresh one.
    window.location.assign(next);
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.24 }} className="card card-pad sm:p-8 border-ink-900/10">
      <span className="badge-ink mb-2">Admin</span>
      <h1 className="mt-2 text-2xl sm:text-3xl">Sign in to the console.</h1>
      <p className="mt-2 text-ink-600 text-sm">Restricted to authorized Avenir staff only.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <label className="label" htmlFor="email">Admin email</label>
          <input id="email" type="email" required autoComplete="email" className="input" placeholder="admin@avenir.ca" value={email} onChange={(e) => setEmail(e.target.value)} />
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
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} Sign in to console
        </button>
      </form>
    </motion.div>
  );
}
