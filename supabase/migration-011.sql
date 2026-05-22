-- ============================================================================
-- Migration 011 — profiles.linkedin_url
--
-- Adds an optional LinkedIn profile URL column on profiles. Used by:
--   1. The student profile editor (/student/profile)
--   2. The sidebar "profile incomplete" red dot (missing linkedin = dot)
--   3. The AI resume tailor on /student/resume — when present, the URL is
--      passed to Groq as part of the student's background context; when
--      absent, the page asks the student to enter it before generating.
-- ============================================================================

alter table public.profiles
  add column if not exists linkedin_url text;
