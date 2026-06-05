// Type definitions only. All runtime data comes from Supabase via lib/db/*.

export type WeekDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type Schedule = {
  /** Days of week the cohort meets, e.g. ['Mon','Wed'] */
  days: WeekDay[];
  /** 24-hour time strings ('19:00') so they fit `<input type="time">` */
  from: string;
  to: string;
  timezone: string;     // e.g. 'EST'
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  cover: string;
  shortDescription: string;
  duration: string;
  timings: string;            // rendered for display, e.g. "Mon & Wed · 7–9 PM EST"
  schedule: Schedule;         // structured source of truth for the timings string
  certificate: boolean;
  registrationStart: string;
  registrationEnd: string;
  cohortStart: string;
  totalSeats: number;
  seatsRemaining: number;
  bestFor: string;
  whatYouWillLearn: string[];
  audience: string;
  color: string;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  courseSlug: string;
  city: string;
  country: string;
  type: string;
  seniority: string;
  salary: string;                    // rendered for display, e.g. "$70k – $85k CAD"
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPeriod: 'year' | 'hour';
  deadline: string;
  entryLevelFriendly: boolean;
  postedAt: string;
  description: string;
  qualifications: string[];
  /** External application URL. When set, students apply on the company site
   *  and the internal job_applications flow is bypassed entirely. */
  applyUrl: string | null;
  /** Admin-only: whether this listing is visible to students. */
  isPublished?: boolean;
};

export type Story = {
  id: string;
  name: string;
  placement: string;
  quote: string;
  avatar: string | null;
  orderIndex?: number;
};

export type FAQ = { q: string; a: string };
/** Database-backed FAQ row. The legacy `FAQ` shape above is kept for the
 *  in-memory seed list; admin-managed rows use this richer shape. */
export type FaqRow = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  orderIndex: number;
};

/** Interview prep — admin-managed topics under a course. */
export type InterviewTopic = {
  id: string;
  courseId: string;
  label: string;
  orderIndex: number;
};

/** Interview prep — a question under a topic, with the model answer. */
export type InterviewQuestionRow = {
  id: string;
  topicId: string;
  question: string;
  answer: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  orderIndex: number;
};

/** Student's bookmarked question with an optional personal note. */
export type InterviewBookmark = {
  questionId: string;
  note: string | null;
  createdAt: string;
};
export type InterviewQuestion = { topic: string; question: string; answer: string };

export type Application = {
  id: string;
  studentName: string;
  email: string;
  phone: string;
  countryCode: string;
  country: string;
  city: string;
  address: string;
  courses: string[];          // course slugs
  status: 'new' | 'contacted' | 'paid' | 'declined';
  createdAt: string;
  isExisting: boolean;
  message: string;
  /** Set once admin mints the auth user (or links to an existing one). Drives the
   *  "Create account" button visibility — never relies on `status` for that gate. */
  authUserId: string | null;
};

export type Student = {
  id: string;
  name: string;
  email: string;
  phone: string;
  courses: string[];          // course slugs (joined via enrollments)
  status: 'active' | 'inactive';
  joinedAt: string;
};

export type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  countryCode: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  avatar: string | null;
  linkedinUrl: string | null;
  joinedAt: string;
  status: 'active' | 'inactive';
};

export type Instructor = {
  name: string;
  title: string;
  photo: string;
  shortBio: string;
  longBio: string;
  yearsExperience: number;
  currentRole: string;
  currentCompany: string;
  location: string;
  education: string;
  specialization: string;
  pastCompanies: string[];
};

export type JobApplication = {
  id: string;
  jobId: string;
  studentName: string;
  email: string;
  appliedAt: string;
  status: 'applied' | 'interview' | 'offer' | 'rejected';
  resumeSnapshotName: string;
  notes: string;
  followUp: string;
};

// Static UI content — these never live in the database.
/**
 * @deprecated FAQs now live in the `faqs` Supabase table and are fetched via
 * `lib/db/faqs.ts`. This array is kept only as a build-time fallback for
 * any code path that hasn't migrated yet. Edit FAQs from the admin console.
 */
export const faqs: FAQ[] = [
  { q: 'Are sessions recorded?', a: 'Yes — every live class is recorded and added to your dashboard within 24 hours so you can revisit any topic at your own pace.' },
  { q: 'Do you help with job placement?', a: 'We do not promise placement, but we run a curated job board (only roles tagged to your track), 1:1 resume reviews, and mock interviews with the instructor.' },
  { q: 'Is there a certificate?', a: 'Yes — you receive a verifiable certificate of completion once you finish all modules and the capstone exercise.' },
  { q: 'How are payments handled?', a: 'Payments happen off-platform via bank transfer or Interac. After payment, our team manually creates your dashboard account and emails you the credentials.' },
  { q: 'Can I take more than one course?', a: 'Absolutely. Many graduates pair Pharmacovigilance with Regulatory Affairs, or Clinical Research with Data Management. You can apply for additional courses anytime from your dashboard.' },
  { q: 'What if I miss a session?', a: 'Watch the recording and bring questions to the next class — every session opens with a 10-minute Q&A specifically for catch-up.' }
];

export const interviewQuestions: InterviewQuestion[] = [
  { topic: 'ICH-GCP', question: 'What are the 13 principles of ICH-GCP and which one would you call out first?', answer: 'Start with patient rights, safety, and well-being prevailing over interests of science and society. Then walk through informed consent, ethics-committee oversight, qualified investigators, protocol adherence, source data accuracy, IMP accountability, quality systems, and confidentiality. Tie each principle to a real action you would take on-site.' },
  { topic: 'Health Canada', question: 'Walk me through a Health Canada CTA submission.', answer: 'Sponsor compiles Module 1 (Canadian admin), Module 2 (summaries), and Modules 3–5 (quality, non-clinical, clinical). REB approval is concurrent. Health Canada has a 30-day default review; no objection letter authorizes the trial. Mention the new CTSP portal for clinical-trial site oversight.' },
  { topic: 'FDA', question: 'How does an IND differ from an NDA?', answer: 'IND authorizes investigational use of a drug in humans before approval; NDA is the application for marketing authorization. IND review is 30 days; NDA review can be 6 (priority) or 10 (standard) months. NDA requires full Phase III evidence; IND only needs early-phase justification.' },
  { topic: 'GCP', question: 'A monitor finds an unsigned consent form during SDV. What do you do?', answer: 'Stop the SDV for that subject, document the finding, escalate to the site PI immediately, and check whether the subject was already enrolled. Issue a protocol deviation, work with the PI to re-consent if the subject is still on study, and follow up with the sponsor and ethics committee per the deviation-reporting timeline.' },
  { topic: 'GMP', question: 'Why does GMP matter for a CRA?', answer: 'CRAs interact with IMP accountability and labelling — both downstream of GMP. Knowing GMP basics (chain of custody, temperature excursions, labelling integrity) helps you spot issues at site that could compromise the trial and the regulatory submission.' },
  { topic: 'General', question: 'Why do you want to move into clinical research?', answer: 'Anchor it in your background (pharmacy / life sciences), highlight a specific spark (a project, an internship, a patient story), and connect it to the role: methodical, regulated work that has a direct patient impact. End with what you have done already to bridge the gap — this program counts.' }
];
