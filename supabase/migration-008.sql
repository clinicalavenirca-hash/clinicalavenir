-- ============================================================================
-- Migration 008 — jobs.apply_url
--
-- Adds an optional external application URL to jobs. When set, the public
-- job detail page renders an "Apply on company site →" button that opens
-- the URL in a new tab instead of creating an internal job_applications
-- row. Admin sees a "External" badge on the listing but can't track
-- candidates for those roles (since the apply happens off-platform).
--
-- Behaviour:
--   apply_url IS NULL  -> current internal flow (resume snapshot + tracker)
--   apply_url IS SET   -> external redirect, no internal tracking
-- ============================================================================

alter table public.jobs
  add column if not exists apply_url text;
