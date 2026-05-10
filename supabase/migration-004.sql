-- ============================================================================
-- Migration 004 — make `courses.seats_remaining` reflect ACTUAL enrolments.
--
-- Problem: today seats_remaining is just a hand-managed integer. The home
-- page shows "8 / 30" but that number doesn't move when admin enrols a
-- student. After this migration:
--   1. A trigger on `enrollments` recomputes `courses.seats_remaining`
--      whenever a row is added or removed.
--   2. Existing rows are backfilled so the count matches the live data.
--   3. Updates fire courses-table realtime events, so the home page
--      "8 / 30 seats" updates within ~1s of admin creating an account.
-- ============================================================================

create or replace function public.tg_recompute_course_seats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  c_id text;
begin
  c_id := coalesce(new.course_id, old.course_id);
  if c_id is null then
    return null;
  end if;

  update public.courses
     set seats_remaining = greatest(
       0,
       total_seats - (
         select count(*)::int
           from public.enrollments
          where course_id = c_id
       )
     )
   where id = c_id;

  return null;
end $$;

drop trigger if exists enrollments_recompute_seats on public.enrollments;
create trigger enrollments_recompute_seats
  after insert or delete on public.enrollments
  for each row execute procedure public.tg_recompute_course_seats();

-- Backfill: align every existing course's seats_remaining with the actual
-- enrolment count so the home page shows the truth right after this runs.
update public.courses c
   set seats_remaining = greatest(
     0,
     c.total_seats - (
       select count(*)::int
         from public.enrollments
        where course_id = c.id
     )
   );
