# Avenir

What the Website Needs
These are the core things a visitor needs to see to trust the platform and enrol.

Home Page
•	A clear headline that says who this is for and what they will get
•	A short description of the course — one paragraph, no jargon
•	Upcoming batch dates with seats available — this creates urgency
•	3 to 5 student testimonials with their name and where they got placed -later on
•	A visible Enrol Now button on the top of the page
•	A short section about the teacher — photo, credentials, years of experience

Courses Page
•	Course name, duration, and schedule — e.g. 8 weeks, Monday and Wednesday 7–9 PM EST
•	What topics are covered — listed clearly, not in paragraph form
•	Who the course is for — career changers, pharmacy graduates, etc.
•	Price and payment options — be upfront about this
•	A batch calendar showing start dates and available seats
•	FAQ section — at minimum: Are sessions recorded? Do you help with job placement? Is there a certificate?

Contact Page
•	A simple form — name, email, phone, and a message box
•	WhatsApp number or link — most students prefer WhatsApp for quick questions
•	Expected response time — e.g. 'We reply within 24 hours'

2. Student Features
These are the tools students use after they land on the site or after they enrol.

Job Board
•	Show job title, company, location, and date posted
•	Filter by cities in Canada, specialisation (RA, PV, Medical Writing), and seniority level
•	Each listing should have a direct apply link
•	Remove listings older than 30 days — stale jobs hurt credibility
•	Add a badge for entry-level friendly roles so new graduates know which ones to target

Resume Builder
•	Pre-built templates specifically for Regulatory Affairs, Pharmacovigilance, and Medical Writing roles
•	Students fill in their details and download a clean, ATS-friendly resume
•	Optionally, add AI rewriting so it improves their bullet points automatically

Interview Prep
•	A question bank with common RA interview questions — FDA, Health Canada, ICH, GCP, GMP
•	Sample answers for each question so students know what good looks like
•	Optionally, a mock interview tool where students record their answers and get feedback

Job Application Tracker
•	A simple board where students track their applications — Applied, Interview Scheduled, Offer, Rejected
•	Fields for company name, role, date applied, follow-up date, and notes
•	Keeps students organized and motivated during the job search

Batch Alerts and Notifications
•	Email notification when a new batch opens
•	Reminder emails 7 days and 1 day before a batch starts for enrolled students


currently only 4 cources (on each topic there will be multiple videos,if admin wants they can add new course later from admin dashboard and upload videos for that also) :
Clinical Research
Clinical Data Management
Pharmacovigilance
Regulatory Affairs

Avenir is a career-program platform for pharmacy and life-sciences graduates breaking into Pharmacovigilance, Regulatory Affairs, Clinical Research, and Clinical Data Management roles in Canada. The site combines a marketing front, a student dashboard, and an admin console behind a single domain. No payments are taken on the website — admissions handles money off-platform and provisions accounts manually, so the on-site experience stays focused on learning, applying for jobs, and tracking the journey from applicant to employed graduate.

A first-time visitor lands on a marketing home page that introduces the four programs, shows upcoming batch dates, profiles the instructor, and ends with a call to apply. The course catalogue lives at /courses and each program has its own detail page describing the curriculum, the cohort start date, registration deadline, total seats, seats remaining, price, certification, and the audience the program is best for. From any course detail page the visitor clicks Apply and fills a single application form: full name, email, phone with a country-code selector, address, and an optional message. The form posts the application to admissions; no payment is collected, and the visitor is told the team will reach out within twenty-four hours.

Admissions takes payment through whatever channel works for that applicant — bank transfer, Interac, WhatsApp negotiation — and once the money is in, the admin clicks "Create account" on the application card. The platform creates the auth user, sends a confirmation email, links the account to the courses the applicant paid for, and marks the original application as paid. The student confirms the email link Supabase sent them, then logs in at /login with the credentials admissions provided. If a student who already has an account applies for a second or third course, the admin sees an "Existing student" badge on the new application and clicks "Add course to {firstName}" instead of creating a new account — the new course slug is appended to that student's owned-courses array and they get instant access without any account churn.

Inside the student dashboard the experience is built around four loops: learning, job-hunting, application tracking, and resume management. The learning loop shows owned courses, lets the student pick one, and plays its videos through a fully custom YouTube player that hides every piece of YouTube branding — no logo, no related-videos overlay, no "Watch on YouTube" link, no native controls. Students get a clean scrubber, play/pause, volume, a 0.5×–2× speed picker, and proper fullscreen, plus keyboard shortcuts for play, seek, mute, and fullscreen. Watched/unwatched is persisted per video so progress survives across sessions and devices.

The job-hunting loop surfaces only roles tagged to courses the student owns — so a Pharmacovigilance student doesn't see Clinical Research jobs, and vice versa. The board supports search across title, company, and description, plus filters for city, course track, seniority, employment type, and an entry-level toggle. Listings older than thirty days are filtered out automatically. Each job has a detail page where the student can apply with one click; the moment they apply, a snapshot of their current resume is attached to the application so the data the admin sees later is exactly what the student had on file when they hit Apply, and the database prevents duplicate applications to the same role.

The application tracker is a Kanban board with four columns — Applied, Interview, Offer, Rejected — and the student can move cards between columns, attach notes, and set follow-up dates. The resume builder offers a single ATS-friendly template: form fields on the left for personal details, summary, experience with bullet-point achievements, education, skills, and certifications, with a live A4 preview on the right that re-renders as you type. Download as PDF uses the browser's native print-to-PDF flow with a print stylesheet that hides everything except the resume paper, so the result is a clean one-page PDF in the student's downloads folder. Interview prep is a topic-filtered question bank covering FDA, Health Canada, ICH, GCP, GMP, and general interview questions, with a sample answer expandable under each question. The student also has a profile page to update name, phone, and password.

The admin console is the operational backbone. The overview shows headline numbers: how many new applications need first contact, active vs total students, live job listings, total videos uploaded, and a revenue tally derived from the price of every course on every paid application. The applications inbox is a realtime stream — when a visitor anywhere in the world hits Submit on the apply form, the new card appears in the admin's open browser tab without a refresh. Each card has WhatsApp, mark contacted, mark paid, decline, internal notes, delete, and the create-account / add-course actions described above; status filtering and a course filter make the inbox triageable as it grows.

Students management is a searchable, filterable table — active, inactive, all — with realtime updates so a deactivation in one tab reflects in another. Each student has a detail page where the admin can edit name, phone, and which courses they own, reset the password (the system generates a new one server-side using the Supabase service role and reveals it once so the admin can copy it to send through their preferred channel), activate or deactivate the account (deactivated students cannot log in), or delete the account entirely. The page also shows the student's job application history.

Courses, videos, and jobs all have full create/edit/delete admin flows. Course editing covers basics, schedule, pricing, cohort dates, total seats, seats remaining, certification, audience, topics, and an inline curriculum editor for weekly modules and their lessons. The video manager is per-course: paste a YouTube watch URL or any standard YouTube link variant and the system normalises it to the embed form, attaches a duration label, a week label, an order index, and a description. Videos can be reordered with up/down buttons. The jobs admin lets the team post a role, tag it to a course track, set the company, location, city, country, type, seniority, deadline, and the entry-level-friendly flag — the same data that drives the student-side filters. Each job's applicants page lists every student who applied, with the resume snapshot they sent at apply time, and the admin can move applicants through the same Applied → Interview → Offer → Rejected pipeline that students see, keeping both sides in sync.

Auth is split across two portals. Students log in at /login; admins log in at /admin/login. If a student tries the admin portal or an admin tries the student portal, the system signs them out of the wrong portal and bounces them to the right one with a clear toast. Both portals offer a "Forgot password?" link that goes to /forgot-password, which sends a Supabase-hosted reset email; clicking the link opens /reset-password where the user sets a new password and is signed in to the right home for their role. Visitors cannot self-sign-up — accounts only exist when admin creates them, which is the whole point: every account on the platform corresponds to a paying student.

Behind the scenes the platform is built on Next.js with the App Router and React, written in TypeScript, styled with Tailwind, and backed entirely by Supabase for Postgres, auth, and realtime. Row-level security is the security boundary: students can only read their own profile, their own resume, their own video progress, their own job applications, the courses they own, and the videos and jobs gated by those courses. Admins can read everything in their tables and run all create/update/delete operations. The few operations that need elevated privileges — creating an auth user, deleting one, and forcing a password reset — go through Next.js API routes that verify the caller is an admin via session cookie before lifting privilege to the service role. Every Supabase query in the app is raced against a hard timeout so a stalled network or a paused Supabase project surfaces as a labeled console error within seconds instead of leaving the UI on an infinite spinner.

