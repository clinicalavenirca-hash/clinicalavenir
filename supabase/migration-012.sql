-- ============================================================================
-- Migration 012 — drop the learning-platform tables
--
-- After the careers-only pivot the platform no longer delivers course
-- content, so the curriculum + progress tables are dead weight:
--
--   * learning_status   (view joining the four below)
--   * video_progress    (per-student per-video watch state)
--   * module_progress   (per-student per-module completion state)
--   * videos            (curriculum videos under modules)
--   * modules           (course curriculum modules)
--
-- Drop order matters because of foreign keys: dependents first, then the
-- view, then the source tables. `cascade` is added defensively so any
-- residual FK from custom policies/functions doesn't block the drop.
--
-- TABLES KEPT:
--   * courses, enrollments       — courses stay for marketing display and
--                                  enrollments still drive the job-board
--                                  track filter
--   * profiles, applications     — unchanged
--   * jobs, job_applications     — career platform proper
--   * instructor, stories        — marketing
--   * contact_messages           — contact form
--   * faqs                       — FAQ section
--   * interview_topics/questions/bookmarks — interview prep
-- ============================================================================

drop view  if exists public.learning_status;
drop table if exists public.video_progress  cascade;
drop table if exists public.module_progress cascade;
drop table if exists public.videos          cascade;
drop table if exists public.modules         cascade;
