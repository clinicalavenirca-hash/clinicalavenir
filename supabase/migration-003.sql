-- ============================================================================
-- Migration 003 — bake `role` into the JWT so middleware doesn't need a DB
-- query on every protected request.
--
-- HOW IT WORKS:
--   1. A trigger on `public.profiles` mirrors `role` into
--      `auth.users.raw_app_meta_data->'role'`.
--   2. Supabase signs the JWT with `app_metadata` from `auth.users`, so on
--      sign-in (or token refresh) the role is in the JWT.
--   3. Middleware reads `user.app_metadata.role` — no DB round-trip.
--
-- AFTER RUNNING THIS:
--   • The included backfill copies every existing profile's role into auth.
--   • Anyone already signed in needs to sign out + sign in once so their JWT
--     picks up the new claim. Fresh logins get it automatically.
-- ============================================================================

create or replace function public.sync_profile_role_to_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') or (new.role is distinct from old.role) then
    update auth.users
       set raw_app_meta_data = jsonb_set(
         coalesce(raw_app_meta_data, '{}'::jsonb),
         '{role}',
         to_jsonb(new.role)
       )
     where id = new.id;
  end if;
  return new;
end $$;

drop trigger if exists profiles_sync_role_to_auth on public.profiles;
create trigger profiles_sync_role_to_auth
  after insert or update of role on public.profiles
  for each row execute procedure public.sync_profile_role_to_auth();

-- Backfill: copy existing profiles.role into auth.users.raw_app_meta_data.role
update auth.users u
   set raw_app_meta_data = jsonb_set(
     coalesce(u.raw_app_meta_data, '{}'::jsonb),
     '{role}',
     to_jsonb(p.role)
   )
  from public.profiles p
 where p.id = u.id
   and (u.raw_app_meta_data ->> 'role') is distinct from p.role;
