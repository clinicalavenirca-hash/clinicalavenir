'use client';
import { ArrowRight } from 'lucide-react';
import { countries } from '@/lib/countries';
import { toast } from '@/components/ui/Toast';

export function ContactForm() {
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Thanks — we'll reply within 24 hours.", 'success');
  };
  return (
    <form onSubmit={submit} className="lg:col-span-7 card card-pad space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div><label className="label">Full name *</label><input required className="input" placeholder="Aarav Mehta" /></div>
        <div><label className="label">Email *</label><input type="email" required className="input" placeholder="you@example.com" /></div>
        <div>
          <label className="label">Phone</label>
          <div className="flex gap-2">
            <select className="input !w-auto !max-w-[110px]">
              {countries.map(c => <option key={c.name}>{c.flag} {c.code}</option>)}
            </select>
            <input type="tel" className="input flex-1" placeholder="437 555 0123" />
          </div>
        </div>
        <div>
          <label className="label">What&apos;s this about?</label>
          <select className="input">
            <option>Course information</option>
            <option>Payment & financing</option>
            <option>Career advice</option>
            <option>Existing student support</option>
            <option>Other</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label">Message *</label>
        <textarea rows={6} required className="input resize-none" placeholder="Tell us a bit about yourself and what you're looking for…" />
      </div>
      <button type="submit" className="btn-primary btn-lg">
        <span>Send message</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </form>
  );
}
