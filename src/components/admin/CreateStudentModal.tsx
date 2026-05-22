'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, RefreshCw, Copy, Check, MessageCircle, UserPlus, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { createStudentDirectly } from '@/app/actions/students';
import { countries } from '@/lib/countries';
import { openWhatsApp } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

type CourseOption = { slug: string; title: string };

/**
 * Admin-only modal to onboard a student directly — no public application
 * needed. Use when someone reaches out off-platform (WhatsApp, phone, in
 * person) and admin wants to create the account immediately.
 *
 * After creation, the success screen shows the credentials with copy
 * buttons and a one-click WhatsApp button so admin can hand off the
 * details fast.
 */
export function CreateStudentModal({ courses }: { courses: CourseOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(() => generatePassword());
  const [countryCode, setCountryCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [enroll, setEnroll] = useState<string[]>([]);
  const [error, setError] = useState('');

  // Result state
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const [copiedField, setCopiedField] = useState<'email' | 'password' | 'both' | null>(null);

  function regen() { setPassword(generatePassword()); }

  function toggleCourse(slug: string) {
    setEnroll((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  function copy(text: string, field: 'email' | 'password' | 'both') {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  }

  function close() {
    setOpen(false);
    // Reset all state after the close transition.
    setTimeout(() => {
      setName(''); setEmail(''); setPassword(generatePassword());
      setCountryCode('+1'); setPhone(''); setCountry(''); setCity(''); setAddress('');
      setLinkedinUrl(''); setEnroll([]); setError(''); setCreated(null);
    }, 220);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const res = await createStudentDirectly({
        name, email, password,
        phone, countryCode, country, city, address,
        linkedinUrl, courseSlugs: enroll
      });
      if (res.error) { setError(res.error); return; }
      setCreated({ email: res.email!, password: res.password! });
      router.refresh();
      toast('Student account created.', 'success');
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-primary btn-md"
      >
        <UserPlus className="w-4 h-4" strokeWidth={2.2} />
        Add student
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-ink-950/50 backdrop-blur-sm grid place-items-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) close(); }}
          >
            <motion.div
              key="modal"
              initial={{ y: 16, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 16, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-2xl shadow-soft-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scroll-thin"
            >
              {created ? (
                <SuccessPanel
                  created={created}
                  onCopy={copy}
                  copiedField={copiedField}
                  name={name}
                  onClose={close}
                />
              ) : (
                <form onSubmit={submit}>
                  <header className="px-5 sm:px-6 py-4 border-b border-ink-100 flex items-center justify-between">
                    <div>
                      <p className="eyebrow">Onboard</p>
                      <h2 className="mt-1 text-lg font-display font-bold">Create student account</h2>
                    </div>
                    <button type="button" onClick={close} className="p-2 -mr-2 rounded-lg hover:bg-ink-100">
                      <X className="w-5 h-5" />
                    </button>
                  </header>

                  <div className="p-5 sm:p-6 space-y-5">
                    <p className="text-sm text-ink-600">
                      No public application needed. Fill in the student&apos;s details, pick a password, and they&apos;ll
                      be able to sign in immediately at /login.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="label">Full name *</label>
                        <input required className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aarav Mehta" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="label">Email *</label>
                        <input required type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aarav@example.com" />
                        <p className="helper">This becomes their login.</p>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="label">Password *</label>
                        <div className="flex gap-2">
                          <input required type="text" className="input flex-1 font-mono text-sm" value={password} onChange={(e) => setPassword(e.target.value)} />
                          <button type="button" onClick={regen} className="btn-secondary btn-md flex-shrink-0" title="Generate a new password">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="helper">14 chars, mixed case + digits. Share this with the student over WhatsApp.</p>
                      </div>

                      <div>
                        <label className="label">Phone</label>
                        <div className="flex gap-2">
                          <select className="input !w-auto !max-w-[110px]" value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                            {countries.map((c) => <option key={c.name} value={c.code}>{c.flag} {c.code}</option>)}
                          </select>
                          <input type="tel" className="input flex-1" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                      </div>
                      <div>
                        <label className="label">Country</label>
                        <select className="input" value={country} onChange={(e) => setCountry(e.target.value)}>
                          <option value="">Select…</option>
                          {countries.map((c) => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
                        </select>
                      </div>
                      <div><label className="label">City</label><input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Toronto" /></div>
                      <div className="sm:col-span-2"><label className="label">Address</label><input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, unit, postal code" /></div>
                      <div className="sm:col-span-2">
                        <label className="label">LinkedIn profile</label>
                        <input type="url" className="input" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://www.linkedin.com/in/..." />
                      </div>
                    </div>

                    {courses.length > 0 && (
                      <div>
                        <label className="label">Tag with course tracks <span className="text-ink-400 font-normal">(controls the job board filter)</span></label>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {courses.map((c) => {
                            const checked = enroll.includes(c.slug);
                            return (
                              <label
                                key={c.slug}
                                className={cn(
                                  'flex items-start gap-2 p-3 rounded-xl border cursor-pointer transition-colors',
                                  checked ? 'border-ink-950 bg-ink-50' : 'border-ink-200 hover:border-ink-400'
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleCourse(c.slug)}
                                  className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                                />
                                <span className="text-sm text-ink-900 leading-tight">{c.title}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="flex items-start gap-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-inset ring-rose-200 rounded-lg px-3 py-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={2.2} />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>

                  <footer className="px-5 sm:px-6 py-4 border-t border-ink-100 flex items-center justify-end gap-2">
                    <button type="button" onClick={close} className="btn-secondary btn-md">Cancel</button>
                    <button type="submit" disabled={pending} className="btn-primary btn-md">
                      {pending && <Loader2 className="w-4 h-4 animate-spin" />}
                      Create account
                    </button>
                  </footer>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SuccessPanel({
  created,
  onCopy,
  copiedField,
  name,
  onClose
}: {
  created: { email: string; password: string };
  onCopy: (text: string, field: 'email' | 'password' | 'both') => void;
  copiedField: 'email' | 'password' | 'both' | null;
  name: string;
  onClose: () => void;
}) {
  function sendWhatsApp() {
    const msg = [
      `Hi ${name.split(' ')[0]} — your Avenir account is ready.`,
      '',
      `*Login:* https://clinicalavenir.vercel.app/login`,
      `*Email:* ${created.email}`,
      `*Password:* ${created.password}`,
      '',
      'Please change your password after signing in for the first time.'
    ].join('\n');
    openWhatsApp(msg);
  }

  return (
    <div>
      <header className="px-5 sm:px-6 py-5 border-b border-ink-100 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 grid place-items-center">
          <Check className="w-6 h-6" strokeWidth={2.5} />
        </div>
        <h2 className="mt-3 text-lg font-display font-bold">Account created</h2>
        <p className="mt-1 text-sm text-ink-500">Share the credentials with the student.</p>
      </header>
      <div className="p-5 sm:p-6 space-y-3">
        <CredentialRow label="Email" value={created.email} copied={copiedField === 'email'} onCopy={() => onCopy(created.email, 'email')} />
        <CredentialRow label="Password" value={created.password} copied={copiedField === 'password'} onCopy={() => onCopy(created.password, 'password')} mono />
        <button
          type="button"
          onClick={sendWhatsApp}
          className="w-full mt-3 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white font-semibold text-sm hover:bg-[#1ebe57] transition-colors shadow-soft"
        >
          <MessageCircle className="w-4 h-4" strokeWidth={2.4} />
          Send credentials on WhatsApp
        </button>
      </div>
      <footer className="px-5 sm:px-6 py-4 border-t border-ink-100 flex justify-end">
        <button type="button" onClick={onClose} className="btn-secondary btn-md">Done</button>
      </footer>
    </div>
  );
}

function CredentialRow({ label, value, copied, onCopy, mono = false }: {
  label: string; value: string; copied: boolean; onCopy: () => void; mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-ink-500">{label}</p>
        <p className={cn('mt-0.5 text-sm text-ink-950 truncate', mono && 'font-mono')}>{value}</p>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-colors flex-shrink-0',
          copied ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-ink-700 ring-1 ring-inset ring-ink-200 hover:ring-ink-400'
        )}
      >
        {copied
          ? <><Check className="w-3.5 h-3.5" strokeWidth={2.4} />Copied</>
          : <><Copy className="w-3.5 h-3.5" strokeWidth={2.2} />Copy</>}
      </button>
    </div>
  );
}

function generatePassword(length = 14): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghjkmnpqrstuvwxyz';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
