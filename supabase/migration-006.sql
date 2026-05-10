-- ============================================================================
-- Migration 006 — make `is_admin()` read the role from the JWT app_metadata
-- claim (set by migration-003's trigger) instead of doing a SELECT on
-- public.profiles every time.
--
-- WHY:
-- Every RLS policy on admin tables calls is_admin(). The previous version
-- did `select role from profiles where id = auth.uid()` which means every
-- admin-side query (and we run 6+ of them on the dashboard alone) costs an
-- extra profile lookup on top of its own work. After this change is_admin()
-- runs in microseconds — it just reads the JWT — so admin pages feel as
-- fast as student pages.
--
-- The fallback to the profiles table is kept so users with stale JWTs
-- (signed in BEFORE migration-003 was run) still work. They just pay the
-- old cost until they sign out + sign in again.
-- ============================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    -- Fast path: the role baked into the JWT by migration-003's trigger.
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    -- Fallback: profile lookup, only hits when the user's JWT doesn't have
    -- the claim yet. After they sign in once post-migration-003 this is
    -- never reached.
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;
