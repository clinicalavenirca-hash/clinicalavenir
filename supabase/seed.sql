-- ============================================================================
-- Avenir — seed data (run after schema.sql)
-- Run AFTER schema.sql. Idempotent — safe to re-run.
-- Note: cover images and story avatars are intentionally left blank here.
--       Upload them through the admin dashboard once Supabase is wired.
-- ============================================================================

-- Instructor (single row keyed by 'default')
insert into public.instructor (
  id, name, title, photo, short_bio, long_bio,
  years_experience, role_label, current_company, location,
  education, specialization, past_companies
) values (
  'default',
  'Gopal Chelikani',
  'Study Coordinator @ Amgen · Clinical Operations & Regulatory Affairs',
  '/Gopal.jpg',
  'Study Coordinator @ Amgen, Toronto. eCTD lifecycle lead across Health Canada and the FDA.',
  'Gopal has spent the last decade inside global pharma and CROs — coordinating clinical trial execution, owning eCTD lifecycle submissions to Health Canada and the FDA, and managing Trial Master Files for oncology and imaging studies. Today he leads study coordination at Amgen in Toronto. Every Avenir cohort is taught with real anonymised case studies, the same templates he has used in regulated submissions at Amgen, WorldCare, Hetero and Parexel — plus weekly 1:1 office hours so no student gets stuck.',
  10,
  'Study Coordinator',
  'Amgen',
  'Toronto',
  'MSc Regulatory Affairs (Clinical Research) · Northeastern University',
  'eCTD lifecycle lead — Health Canada, FDA (NDS, SNDS, IND, NDA, BLA)',
  array['Amgen','PulseBridge','WorldCare','Imaging Endpoints','Hetero','Parexel']
)
on conflict (id) do update set
  name = excluded.name,
  title = excluded.title,
  photo = excluded.photo,
  short_bio = excluded.short_bio,
  long_bio = excluded.long_bio,
  years_experience = excluded.years_experience,
  role_label = excluded.role_label,
  current_company = excluded.current_company,
  location = excluded.location,
  education = excluded.education,
  specialization = excluded.specialization,
  past_companies = excluded.past_companies;

-- Courses (4 default tracks)
insert into public.courses (
  id, slug, title, tagline, cover, short_description,
  duration, timings, certificate,
  registration_start, registration_end, cohort_start,
  total_seats, seats_remaining, best_for, what_you_will_learn, audience, color, is_published
) values
  ('cr','clinical-research','Clinical Research','Become a clinical trial specialist',
   'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=900&q=70',
   'Learn ICH-GCP, study design, monitoring, and the trial lifecycle from protocol to closeout — guided by a Canada-based clinical lead.',
   '8 weeks','Mon & Wed · 7–9 PM EST',true,
   '2026-04-15','2026-06-01','2026-06-10',
   30,8,
   'Pharmacy graduates, life-sciences postgrads, healthcare professionals pivoting into research.',
   '["ICH-GCP and Health Canada regulatory framework","Protocol design, CRF design, and study feasibility","Site monitoring and source data verification","Adverse event reporting and safety oversight","Sponsor / CRO collaboration in real workflows"]'::jsonb,
   'Career changers entering CRA / CRC roles in Canada.',
   'from-brand-600 to-brand-800', true),

  ('cdm','clinical-data-management','Clinical Data Management','Own the data behind every trial',
   'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=70',
   'Master EDC systems, CRF design, query management, and CDISC standards — the operational backbone of every modern trial.',
   '8 weeks','Tue & Thu · 7–9 PM EST',true,
   '2026-04-20','2026-06-05','2026-06-15',
   30,12,
   'Detail-oriented graduates who love clean data and structured systems.',
   '["EDC platforms (Medidata Rave, Veeva, Oracle InForm)","CRF and edit-check design","Data validation and query workflows","CDISC SDTM and ADaM mapping basics","Database lock and trial-master-file practices"]'::jsonb,
   'Aspiring CDMs, data coordinators, and database programmers.',
   'from-brand-700 to-brand-900', true),

  ('pv','pharmacovigilance','Pharmacovigilance','Patient safety, end to end',
   'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=70',
   'Case processing, signal detection, periodic reporting, and regulatory submissions across FDA, Health Canada, and EMA.',
   '10 weeks','Mon & Wed · 7:30–9:30 PM EST',true,
   '2026-04-10','2026-05-25','2026-06-03',
   30,4,
   'Pharmacy and pharmacology graduates passionate about drug safety.',
   '["ICSR processing in Argus / ArisGlobal","MedDRA coding and seriousness assessment","Aggregate reports: PSUR, PBRER, DSUR","Signal detection and risk-management plans","Health-Canada, FDA, and EMA submission flows"]'::jsonb,
   'Future PV associates, drug-safety officers, and case processors.',
   'from-brand-600 to-brand-900', true),

  ('ra','regulatory-affairs','Regulatory Affairs','Bring therapies to market',
   'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=70',
   'Submission strategy, eCTD authoring, and life-cycle management across Health Canada, FDA, and EMA — built for the Canadian market.',
   '10 weeks','Tue & Thu · 7:30–9:30 PM EST',true,
   '2026-04-25','2026-06-10','2026-06-17',
   30,16,
   'Strategic thinkers who want to shape how drugs reach patients.',
   '["Health Canada NDS / ANDS / SNDS submissions","eCTD structure and module-3 authoring basics","FDA 510(k) and IND/NDA pathways","Labelling, post-market commitments, and life-cycle management","Regulatory intelligence and agency interaction"]'::jsonb,
   'Future RA associates, submissions specialists, and strategy analysts.',
   'from-brand-700 to-brand-950', true)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  tagline = excluded.tagline,
  cover = excluded.cover,
  short_description = excluded.short_description,
  duration = excluded.duration,
  timings = excluded.timings,
  certificate = excluded.certificate,
  registration_start = excluded.registration_start,
  registration_end = excluded.registration_end,
  cohort_start = excluded.cohort_start,
  total_seats = excluded.total_seats,
  seats_remaining = excluded.seats_remaining,
  best_for = excluded.best_for,
  what_you_will_learn = excluded.what_you_will_learn,
  audience = excluded.audience,
  color = excluded.color,
  is_published = excluded.is_published;

-- Stories (graduate testimonials)
insert into public.stories (id, name, placement, quote, avatar, order_index) values
  ('11111111-1111-1111-1111-111111111111', 'Anjali R.', 'CRA I — Veristat, Toronto',     'I went from pharmacy graduate to landing a CRA role in 4 months. The Health-Canada module alone was worth it.', null, 1),
  ('22222222-2222-2222-2222-222222222222', 'Daniel K.', 'PV Associate — IQVIA, Mississauga', 'The case-processing labs felt like real day-1 work. My first week on the job was just continuation of class.', null, 2),
  ('33333333-3333-3333-3333-333333333333', 'Priya S.',  'RA Specialist — Bayer, Toronto',    'The instructor walked us through real eCTD structures. That clarity made the difference in interviews.',          null, 3)
on conflict (id) do update set
  name = excluded.name,
  placement = excluded.placement,
  quote = excluded.quote,
  order_index = excluded.order_index;
