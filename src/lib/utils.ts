import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(d: string | Date, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }) {
  return new Date(d).toLocaleDateString('en-CA', opts);
}

const cadFmt = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0
});

/** Renders amounts as Canadian dollars with an explicit CAD suffix, e.g. `$1,499 CAD`. */
export function formatCurrency(n: number) {
  return `${cadFmt.format(n)} CAD`;
}

/** True when the registration window has passed and applications are closed. */
export function isCourseRegistrationClosed(course: { registrationEnd?: string | null }): boolean {
  const end = course.registrationEnd;
  if (!end) return false;
  const today = new Date().toISOString().slice(0, 10);
  return end < today;
}

/** True when the job's application deadline has passed. */
export function isJobDeadlinePassed(job: { deadline?: string | null }): boolean {
  const d = job.deadline;
  if (!d) return false;
  const today = new Date().toISOString().slice(0, 10);
  return d < today;
}

/**
 * Renders a salary range as `$70k – $85k CAD` for annual and `$25 – $32/hr CAD`
 * for hourly. Returns an empty string when both values are missing so the UI
 * can hide the chip cleanly.
 */
/** "19:00" → "7 PM", "19:30" → "7:30 PM" */
export function formatTime12h(hhmm: string | null | undefined): string {
  if (!hhmm) return '';
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h)) return '';
  const meridiem = h >= 12 ? 'PM' : 'AM';
  const h12 = ((h + 11) % 12) + 1;
  return m && m !== 0 ? `${h12}:${String(m).padStart(2, '0')} ${meridiem}` : `${h12} ${meridiem}`;
}

/** Render a course schedule as `Mon & Wed · 7–9 PM EST`. Empty string when unset. */
export function formatSchedule(schedule: { days?: string[]; from?: string; to?: string; timezone?: string } | null | undefined): string {
  if (!schedule) return '';
  const days = schedule.days ?? [];
  const dayPart = days.length === 0 ? '' : days.length <= 2 ? days.join(' & ') : days.join(', ');
  const fromLabel = formatTime12h(schedule.from);
  const toLabel = formatTime12h(schedule.to);
  // collapse meridiem: "7 PM – 9 PM" → "7–9 PM" when meridiems match
  let timePart = '';
  if (fromLabel && toLabel) {
    const fm = fromLabel.split(' ').pop();
    const tm = toLabel.split(' ').pop();
    if (fm && fm === tm) {
      timePart = `${fromLabel.replace(` ${fm}`, '')}–${toLabel}`;
    } else {
      timePart = `${fromLabel} – ${toLabel}`;
    }
  } else if (fromLabel) timePart = fromLabel;
  else if (toLabel) timePart = `until ${toLabel}`;
  const tz = schedule.timezone?.trim();
  return [dayPart, timePart, tz].filter(Boolean).join(' · ');
}

export function formatSalaryRange(min: number | null | undefined, max: number | null | undefined, period: 'year' | 'hour' = 'year'): string {
  const fmtAnnual = (n: number) => n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n.toLocaleString('en-CA')}`;
  const fmtHourly = (n: number) => `$${n.toLocaleString('en-CA')}`;
  const fmt = period === 'year' ? fmtAnnual : fmtHourly;
  const suffix = period === 'year' ? 'CAD' : '/hr CAD';
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)} ${suffix}`;
  if (min != null) return `${fmt(min)}+ ${suffix}`;
  if (max != null) return `up to ${fmt(max)} ${suffix}`;
  return '';
}

/**
 * Spell small counts in title-case ("One", "Two", "Four") for use in eyebrow
 * labels like "Four tracks". Falls back to the digit string for >12 so we
 * don't end up with awkward word-counts.
 */
const NUMBER_WORDS = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six',
  'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'
];
export function spellCount(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

export function initials(name: string, max = 2) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, max)
    .toUpperCase();
}
