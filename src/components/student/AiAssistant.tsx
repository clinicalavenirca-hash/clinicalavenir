'use client';
import { useState, useTransition } from 'react';
import { Loader2, ArrowRight, Copy, Check, FileText, Mail, AlertCircle, BookOpen } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { tailorResume, generateCoverLetter } from '@/app/actions/ai';
import { cn } from '@/lib/utils';

type Mode = 'tailor' | 'cover';

/**
 * Two-tab AI assistant for resume tailoring and cover letter generation.
 *
 * Left column: inputs (job title, company, JD, resume or background).
 * Right column: output panel with copy-to-clipboard.
 *
 * Prefill comes from a `?job=<id>` deep link on /student/ai-assistant — the
 * server reads the job and passes its title + company + description down.
 */
export function AiAssistant({
  candidateName,
  initialMode,
  prefill
}: {
  candidateName: string;
  initialMode: Mode;
  prefill: { jobTitle: string; company: string; jobDescription: string } | null;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [jobTitle, setJobTitle] = useState(prefill?.jobTitle ?? '');
  const [company, setCompany] = useState(prefill?.company ?? '');
  const [jobDescription, setJobDescription] = useState(prefill?.jobDescription ?? '');
  const [resume, setResume] = useState('');
  const [background, setBackground] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  function run() {
    setError('');
    setOutput('');
    startTransition(async () => {
      if (mode === 'tailor') {
        if (!jobDescription.trim() || !resume.trim()) {
          setError('Both the job description and your current resume are required.');
          return;
        }
        const res = await tailorResume({ jobTitle, company, jobDescription, resume });
        if (res.error) { setError(res.error); return; }
        setOutput(res.content ?? '');
      } else {
        if (!jobDescription.trim() || !background.trim()) {
          setError('Job description and your background are required.');
          return;
        }
        const res = await generateCoverLetter({
          jobTitle,
          company,
          jobDescription,
          candidateName,
          candidateBackground: background
        });
        if (res.error) { setError(res.error); return; }
        setOutput(res.content ?? '');
      }
    });
  }

  function copy() {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      toast('Copied to clipboard.', 'success');
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="space-y-5">
      {/* Mode tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => { setMode('tailor'); setOutput(''); setError(''); }}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors',
            mode === 'tailor'
              ? 'bg-ink-950 text-white'
              : 'bg-white text-ink-700 ring-1 ring-inset ring-ink-200 hover:ring-ink-400'
          )}
        >
          <FileText className="w-3.5 h-3.5" strokeWidth={2.2} />
          Tailor resume
        </button>
        <button
          type="button"
          onClick={() => { setMode('cover'); setOutput(''); setError(''); }}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors',
            mode === 'cover'
              ? 'bg-ink-950 text-white'
              : 'bg-white text-ink-700 ring-1 ring-inset ring-ink-200 hover:ring-ink-400'
          )}
        >
          <Mail className="w-3.5 h-3.5" strokeWidth={2.2} />
          Cover letter
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* INPUTS */}
        <div className="card card-pad space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Job title</label>
              <input
                className="input"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Clinical Research Associate I"
              />
            </div>
            <div>
              <label className="label">Company</label>
              <input
                className="input"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="IQVIA"
              />
            </div>
          </div>
          <div>
            <label className="label">Job description *</label>
            <textarea
              rows={8}
              className="input resize-none font-mono text-xs"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here. Include responsibilities and qualifications."
            />
          </div>

          {mode === 'tailor' ? (
            <div>
              <label className="label">Your current resume *</label>
              <textarea
                rows={12}
                className="input resize-none font-mono text-xs"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder={'Paste your resume — sections separated by blank lines. Example:\n\nSUMMARY\nPharmD graduate with site-monitoring training...\n\nEXPERIENCE\nPharmacy Intern, Shoppers Drug Mart, May–Aug 2024\n• Counselled 30+ patients daily...'}
              />
              <p className="helper">Bullet points, action verbs, real numbers — the more specific the input, the better the output.</p>
            </div>
          ) : (
            <div>
              <label className="label">Your background *</label>
              <textarea
                rows={10}
                className="input resize-none text-sm"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                placeholder="3–5 sentences about your education, internships, and the specific skills that matter for this role. Mention any certifications and tools you've used."
              />
              <p className="helper">Writing as &quot;{candidateName}&quot;. Sign-off is added automatically.</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-inset ring-rose-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={2.2} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={run}
            disabled={pending}
            className="btn-primary btn-md w-full justify-center"
          >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {pending
              ? 'Generating…'
              : mode === 'tailor'
                ? 'Tailor my resume'
                : 'Draft cover letter'}
            {!pending && <ArrowRight className="w-4 h-4" strokeWidth={2.2} />}
          </button>
        </div>

        {/* OUTPUT */}
        <div className="card overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between gap-3">
            <p className="eyebrow !text-ink-700">
              {mode === 'tailor' ? 'Tailored resume' : 'Cover letter draft'}
            </p>
            <button
              type="button"
              onClick={copy}
              disabled={!output}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors disabled:opacity-40',
                copied ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-ink-700 ring-1 ring-inset ring-ink-200 hover:ring-ink-400'
              )}
            >
              {copied
                ? <><Check className="w-3.5 h-3.5" strokeWidth={2.4} />Copied</>
                : <><Copy className="w-3.5 h-3.5" strokeWidth={2.2} />Copy</>}
            </button>
          </div>
          <div className="flex-1 p-5 min-h-[400px]">
            {pending ? (
              <div className="h-full grid place-items-center text-ink-500">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <p className="text-sm">Generating with Groq…</p>
                </div>
              </div>
            ) : output ? (
              <pre className="text-sm text-ink-800 leading-relaxed whitespace-pre-wrap font-sans">{output}</pre>
            ) : (
              <div className="h-full grid place-items-center text-center px-6">
                <div className="max-w-sm">
                  <BookOpen className="w-8 h-8 mx-auto text-ink-300" strokeWidth={1.8} />
                  <p className="mt-3 text-sm text-ink-500">
                    {mode === 'tailor'
                      ? 'Paste a JD and your current resume, then tap "Tailor my resume". The AI keeps your real experience and reframes it for the target role.'
                      : 'Paste a JD and a short note about your background, then tap "Draft cover letter". The AI returns a 220–320 word letter you can review and send.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-ink-500 max-w-2xl">
        <strong className="text-ink-700">A note on AI output:</strong> always review before submitting.
        The model is instructed never to fabricate experience, but you&apos;re the one signing the
        application — double-check every fact, company name, date, and number.
      </p>
    </div>
  );
}
