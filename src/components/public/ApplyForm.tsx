'use client';
import { useEffect, useState, useTransition } from 'react';
import { ArrowRight, ShoppingCart, X, Loader2, Check } from 'lucide-react';
import { countries } from '@/lib/countries';
import { toast } from '@/components/ui/Toast';
import { submitApplication } from '@/app/actions/applications';
import { openWhatsApp } from '@/lib/whatsapp';

type CatalogItem = { slug: string; title: string; duration: string; timings: string };

/** Optional pre-fill for the contact-details fields. Filled in when a logged-in
 *  student visits /apply to enrol in additional courses — saves them re-typing
 *  every field. */
export type InitialProfile = {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  country: string;
  city: string;
  address: string;
};

export function ApplyForm({
  preselected,
  catalog,
  initialProfile,
  enrolledSlugs = []
}: {
  preselected: string;
  catalog: CatalogItem[];
  initialProfile?: InitialProfile | null;
  /** Course slugs the signed-in student is already enrolled in. Those rows
   *  render as disabled "Already enrolled" tiles so they can't be re-applied. */
  enrolledSlugs?: string[];
}) {
  const [cart, setCart] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const isReturningStudent = Boolean(initialProfile);

  // Form fields — prefilled when a student is signed in.
  const [fullName, setFullName] = useState(initialProfile?.name ?? '');
  const [email, setEmail] = useState(initialProfile?.email ?? '');
  const [countryCode, setCountryCode] = useState(initialProfile?.countryCode ?? '+1');
  const [phone, setPhone] = useState(initialProfile?.phone ?? '');
  const [country, setCountry] = useState(initialProfile?.country ?? '');
  const [city, setCity] = useState(initialProfile?.city ?? '');
  const [address, setAddress] = useState(initialProfile?.address ?? '');
  const [message, setMessage] = useState('');
  const [agreed, setAgreed] = useState(false);

  const enrolledSet = new Set(enrolledSlugs);
  useEffect(() => {
    // Don't preselect a course the student already owns — would only get
    // rejected later. Skip silently.
    if (preselected && !enrolledSet.has(preselected)) setCart([preselected]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselected]);

  const toggle = (slug: string) => {
    if (enrolledSet.has(slug)) return;
    setCart((c) => (c.includes(slug) ? c.filter((s) => s !== slug) : [...c, slug]));
  };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cart.length) return;
    if (!agreed) { toast('Please confirm you understand the off-platform payment.', 'warning'); return; }
    startTransition(async () => {
      const res = await submitApplication({
        fullName, email, countryCode, phone, country, city, address, message, courseSlugs: cart
      });
      if (res?.error) { toast(res.error, 'error'); return; }
      setDone(true);
      toast('Application submitted. Our team will reach out within 24 hours.', 'success');

      // Open WhatsApp with the application details so the user can also
      // ping admin directly — admin already has the record in the DB.
      const programLabels = cart
        .map((slug) => catalog.find((c) => c.slug === slug)?.title ?? slug)
        .map((t) => `• ${t}`)
        .join('\n');
      const waMessage = [
        '*New course application — Avenir*',
        '',
        `*Name:* ${fullName}`,
        `*Email:* ${email}`,
        phone ? `*Phone:* ${countryCode} ${phone}` : null,
        country ? `*Location:* ${[city, country].filter(Boolean).join(', ')}` : null,
        '',
        '*Programs applied for:*',
        programLabels,
        message ? `\n*Note:* ${message}` : null
      ].filter(Boolean).join('\n');
      openWhatsApp(waMessage);
    });
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto card card-pad text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 grid place-items-center mx-auto"><Check className="w-7 h-7" strokeWidth={2.5} /></div>
        <h2 className="mt-4 text-2xl">Application received.</h2>
        <p className="mt-2 text-ink-600">Our admissions team will email you within 24 hours with payment options and next steps. You&apos;ll also get a WhatsApp message if you provided a phone number.</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      <form onSubmit={onSubmit} className="lg:col-span-8 space-y-8">
        {isReturningStudent && (
          <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-ink-800">
            <p className="font-semibold text-brand-800">Welcome back, {fullName.split(' ')[0]}.</p>
            <p className="mt-1 text-ink-700">
              Pick the new programs you&apos;d like to enrol in below. We&apos;ve pre-filled your contact details — admin will match this application to your existing account, no new login needed.
            </p>
          </div>
        )}
        <div className="card card-pad">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <p className="eyebrow">Step 1</p>
              <h2 className="mt-1 text-xl">Choose your courses</h2>
              <p className="mt-1 text-sm text-ink-600">You can apply to more than one program. We&apos;ll create a single dashboard with everything you select.</p>
            </div>
            <span className="badge-brand">{cart.length} selected</span>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {catalog.map((c) => {
              const enrolled = enrolledSet.has(c.slug);
              const checked = cart.includes(c.slug);
              const containerCls = enrolled
                ? 'border-ink-200 bg-ink-100/60 opacity-70 cursor-not-allowed'
                : checked
                ? 'border-brand-500 bg-brand-50 cursor-pointer'
                : 'border-ink-200 hover:border-brand-400 hover:bg-brand-50/30 cursor-pointer';
              return (
                <label key={c.slug} className={`relative flex items-start gap-3 p-4 rounded-xl border transition-colors ${containerCls}`}>
                  <input
                    type="checkbox"
                    checked={enrolled ? false : checked}
                    onChange={() => toggle(c.slug)}
                    disabled={enrolled}
                    className="mt-1 rounded text-brand-600 focus:ring-brand-500 disabled:opacity-50"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-ink-900 text-sm">{c.title}</p>
                      {enrolled && <span className="badge-success text-[10px]">Already enrolled</span>}
                    </div>
                    <p className="mt-0.5 text-xs text-ink-500">{c.duration} · {c.timings}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="card card-pad">
          <p className="eyebrow">Step 2</p>
          <h2 className="mt-1 text-xl">Your details</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2"><label className="label">Full name *</label><input required className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Aarav Mehta" /></div>
            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                required
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                readOnly={isReturningStudent}
              />
              {isReturningStudent && <p className="helper">Locked to your account email so admin can match this application to you.</p>}
            </div>
            <div>
              <label className="label">Phone *</label>
              <div className="flex gap-2">
                <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="input !w-auto !max-w-[120px]" required>
                  {countries.map((c) => <option key={c.name} value={c.code}>{c.flag} {c.code}</option>)}
                </select>
                <input type="tel" required className="input flex-1" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="437 555 0123" />
              </div>
            </div>
            <div>
              <label className="label">Country *</label>
              <select required className="input" value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="" disabled>Select country…</option>
                {countries.map((c) => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
              </select>
            </div>
            <div><label className="label">City</label><input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Toronto" /></div>
            <div className="sm:col-span-2"><label className="label">Address</label><input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, unit, postal code" /></div>
            <div className="sm:col-span-2">
              <label className="label">Anything we should know? <span className="text-ink-400 font-normal">(optional)</span></label>
              <textarea rows={4} className="input resize-none" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="A short note about your background or questions you have…" />
            </div>
          </div>
        </div>

        <div className="card card-pad bg-ink-50">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required className="mt-1 rounded text-brand-600 focus:ring-brand-500" />
            <span className="text-sm text-ink-700">I understand that no payment is collected on this site. The Avenir admissions team will contact me within 24 hours with payment options and next steps.</span>
          </label>
        </div>

        <button type="submit" disabled={!cart.length || pending} className="btn-primary btn-lg w-full sm:w-auto">
          {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          {cart.length === 0 ? 'Select at least one course to apply' : pending ? 'Submitting…' : 'Submit application'}
          {!pending && <ArrowRight className="w-5 h-5" />}
        </button>
      </form>

      <aside className="lg:col-span-4">
        <div className="lg:sticky lg:top-24 card card-pad">
          <p className="eyebrow">Your selection</p>
          <h3 className="mt-1 text-lg">Application summary</h3>
          {cart.length === 0 ? (
            <div className="mt-6 text-center py-8 border-2 border-dashed border-ink-200 rounded-xl">
              <ShoppingCart className="w-10 h-10 mx-auto text-ink-300" strokeWidth={1.5} />
              <p className="mt-3 text-sm text-ink-500">No courses selected yet.<br />Pick at least one program above.</p>
            </div>
          ) : (
            <>
              <ul className="mt-5 space-y-3">
                {cart.map((slug) => {
                  const c = catalog.find((c) => c.slug === slug);
                  if (!c) return null;
                  return (
                    <li key={slug} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-ink-50">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-ink-900">{c.title}</p>
                        <p className="text-xs text-ink-500">{c.duration} · {c.timings}</p>
                      </div>
                      <button type="button" onClick={() => toggle(slug)} className="p-1 rounded hover:bg-ink-200 text-ink-500 flex-shrink-0"><X className="w-4 h-4" /></button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-5 pt-5 border-t border-ink-100 space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-ink-500">Programs</span><span className="font-display text-xl font-bold text-ink-900">{cart.length}</span></div>
                <p className="text-xs text-ink-500 leading-relaxed pt-2">Our admissions team will share payment details with you off-platform after they verify your application.</p>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
