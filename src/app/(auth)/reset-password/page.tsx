'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { toast } from '@/components/ui/Toast';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function ResetPage() {
  const router = useRouter();
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [busy, setBusy] = useState(false);
  const strong = p1.length >= 8 && /[A-Z]/.test(p1) && /[0-9]/.test(p1);
  const match = p1.length > 0 && p1 === p2;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!strong || !match) return;
    const supabase = supabaseBrowser();
    if (!supabase) { toast('Supabase is not configured.', 'error'); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: p1 });
    setBusy(false);
    if (error) { toast(error.message, 'error'); return; }
    toast('Password updated. Redirecting…', 'success');
    // Re-fetch user role to land on the right home
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      router.push(profile?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } else {
      router.push('/login');
    }
    router.refresh();
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.24 }} className="card card-pad sm:p-8">
      <span className="eyebrow">New password</span>
      <h1 className="mt-2 text-2xl sm:text-3xl">Set a new password.</h1>
      <p className="mt-2 text-ink-600 text-sm">Choose something at least 8 characters, with one uppercase letter and one number.</p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <label className="label" htmlFor="np">New password</label>
          <div className="mt-1.5">
            <PasswordInput id="np" value={p1} onChange={(e) => setP1(e.target.value)} required placeholder="••••••••" autoComplete="new-password" />
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <div className="h-1 flex-1 rounded-full bg-ink-100 overflow-hidden">
              <div className={`h-full transition-all ${p1.length === 0 ? 'w-0' : strong ? 'bg-emerald-500 w-full' : p1.length >= 4 ? 'bg-amber-500 w-2/3' : 'bg-rose-500 w-1/3'}`} />
            </div>
            <span className={`text-xs font-medium ${strong ? 'text-emerald-700' : 'text-ink-500'}`}>
              {p1.length === 0 ? '' : strong ? 'Strong' : 'Keep going'}
            </span>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="np2">Confirm password</label>
          <PasswordInput id="np2" value={p2} onChange={(e) => setP2(e.target.value)} required placeholder="••••••••" autoComplete="new-password" />
          {p2 && !match && <p className="error">Passwords don&apos;t match.</p>}
        </div>
        <button type="submit" disabled={!strong || !match || busy} className="btn-primary btn-lg w-full justify-center">
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} Set new password
        </button>
      </form>
    </motion.div>
  );
}
