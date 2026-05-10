-- ============================================================================
-- Migration 005 — Avenir is moving to a price-free product. Admissions handles
-- billing entirely off-platform, so the database no longer stores course
-- prices or per-application amounts.
--
-- Drops:
--   • courses.price
--   • applications.amount
-- After running this, the dashboard's "Revenue" card disappears, course
-- detail pages stop showing a dollar amount, and the apply form's cart no
-- longer shows totals.
-- ============================================================================

alter table public.courses
  drop column if exists price;

alter table public.applications
  drop column if exists amount;
