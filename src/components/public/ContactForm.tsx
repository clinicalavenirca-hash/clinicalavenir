'use client';
import { useState, useTransition } from 'react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { countries } from '@/lib/countries';
import { toast } from '@/components/ui/Toast';
import { submitContactMessage } from '@/app/actions/contactMessages';
import { openWhatsAppTab, navigateWhatsAppTab } from '@/lib/whatsapp';

const TOPICS = [
  'Course information',
  'Payment & financing',
  'Career advice',
  'Existing student support',
  'Other'
];

/**
 * Public contact form. On success swaps to a celebratory tick-and-message
 * panel (mirrors ApplyForm's pattern). Falls back to an inline error if
 * the server action returns one.
 */
export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending || done) return;

    // Compose the WhatsApp message body up-front.
    const waMessage = [
      '*New enquiry — Avenir*',
      '',
      `*Name:* ${fullName}`,
      `*Email:* ${email}`,
      phone ? `*Phone:* ${countryCode} ${phone}` : null,
      topic ? `*Topic:* ${topic}` : null,
      '',
      '*Message:*',
      message
    ].filter(Boolean).join('\n');

    // Open the WhatsApp tab synchronously BEFORE the await so the browser
    // counts it as part of the click gesture (otherwise popup blockers
    // silently kill window.open after async work).
    const waTab = openWhatsAppTab();

    startTransition(async () => {
      const res = await submitContactMessage({
        fullName,
        email,
        countryCode,
        phone,
        topic,
        message
      });
      if (res?.error) {
        waTab?.close();
        toast(res.error, 'error');
        return;
      }
      navigateWhatsAppTab(waTab, waMessage);
      setDone(true);
    });
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="text-center py-10 px-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.05 }}
          className="w-16 h-16 rounded-full bg-emerald-500 text-white grid place-items-center mx-auto shadow-soft-lg"
        >
          <Check className="w-8 h-8" strokeWidth={2.6} />
        </motion.div>
        <h3 className="mt-5 text-2xl font-display font-bold text-ink-950">Message received.</h3>
        <p className="mt-3 text-ink-600 max-w-md mx-auto leading-relaxed">
          Our team replies within 24 hours. A WhatsApp draft with your message has opened in a
          new tab — tap send to also reach us there for the fastest reply.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label">Full name *</label>
          <input
            required
            className="input"
            placeholder="Aarav Mehta"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Email *</label>
          <input
            type="email"
            required
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Phone</label>
          <div className="flex gap-2">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="input !w-auto !max-w-[110px]"
            >
              {countries.map((c) => (
                <option key={c.name} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            <input
              type="tel"
              className="input flex-1"
              placeholder="437 555 0123"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="label">What&apos;s this about?</label>
          <select
            className="input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          >
            {TOPICS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Message *</label>
        <textarea
          rows={6}
          required
          className="input resize-none"
          placeholder="Tell us a bit about yourself and what you're looking for…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <button type="submit" disabled={pending} className="btn-primary btn-lg">
        {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
        <span>{pending ? 'Sending…' : 'Send message'}</span>
        {!pending && <ArrowRight className="w-5 h-5" />}
      </button>
    </form>
  );
}
