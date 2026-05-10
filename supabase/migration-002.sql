-- ============================================================================
-- Migration 002 — adds:
--   • applications.auth_user_id      (track when an account has been minted)
--   • jobs.salary_min / salary_max / salary_period
--   • courses.schedule jsonb         (structured day/time picker)
--
-- Run this once in Supabase SQL editor.  Idempotent.
-- ============================================================================

-- 1. Track which auth user was created from a given application so the
--    "Create account" button only disappears once an account exists, not when
--    the admin marks contacted/paid.
alter table public.applications
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;
create index if not exists applications_auth_user_idx on public.applications(auth_user_id);

-- 2. Salary range fields on jobs.  Existing `salary` text stays around as the
--    rendered display string ("$70k – $85k CAD"), but min/max are the source
--    of truth so the edit form can prefill range inputs cleanly.
alter table public.jobs
  add column if not exists salary_min integer,
  add column if not exists salary_max integer,
  add column if not exists salary_period text default 'year' check (salary_period in ('year','hour'));

-- 3. Structured course schedule.  Format we store:
--    { days: ['Mon','Wed'], from: '19:00', to: '21:00', timezone: 'EST' }
alter table public.courses
  add column if not exists schedule jsonb default '{}'::jsonb;
