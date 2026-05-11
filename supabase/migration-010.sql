-- ============================================================================
-- Migration 010 — interview prep (topics + questions + student bookmarks)
--
-- Strategy:
--   * topics belong to a course (admin organizes per track)
--   * questions belong to a topic
--   * any authenticated student can read all topics/questions — gating
--     by enrollment happens in the UI, not RLS, so a student can browse
--     adjacent tracks if curious
--   * bookmarks are per-user-per-question with an optional note for
--     "save to my notes" practice
-- ============================================================================

-- ---------- TOPICS ----------------------------------------------------------
create table if not exists public.interview_topics (
  id           uuid primary key default gen_random_uuid(),
  course_id    text not null references public.courses(id) on delete cascade,
  label        text not null,
  order_index  integer not null default 100,
  created_at   timestamptz not null default now()
);
create index if not exists interview_topics_course_idx
  on public.interview_topics (course_id, order_index, created_at);

alter table public.interview_topics enable row level security;

drop policy if exists "interview_topics_auth_read" on public.interview_topics;
create policy "interview_topics_auth_read" on public.interview_topics
  for select using (auth.uid() is not null);

drop policy if exists "interview_topics_admin_all" on public.interview_topics;
create policy "interview_topics_admin_all" on public.interview_topics
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- QUESTIONS -------------------------------------------------------
create table if not exists public.interview_questions (
  id           uuid primary key default gen_random_uuid(),
  topic_id     uuid not null references public.interview_topics(id) on delete cascade,
  question     text not null,
  answer       text not null,
  difficulty   text not null default 'beginner'
    check (difficulty in ('beginner', 'intermediate', 'advanced')),
  order_index  integer not null default 100,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists interview_questions_topic_idx
  on public.interview_questions (topic_id, order_index, created_at);

create or replace function public.interview_questions_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists interview_questions_touch on public.interview_questions;
create trigger interview_questions_touch
  before update on public.interview_questions
  for each row execute function public.interview_questions_touch_updated_at();

alter table public.interview_questions enable row level security;

drop policy if exists "interview_questions_auth_read" on public.interview_questions;
create policy "interview_questions_auth_read" on public.interview_questions
  for select using (auth.uid() is not null);

drop policy if exists "interview_questions_admin_all" on public.interview_questions;
create policy "interview_questions_admin_all" on public.interview_questions
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- BOOKMARKS (per-user "saved to my notes") ------------------------
create table if not exists public.interview_bookmarks (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  question_id  uuid not null references public.interview_questions(id) on delete cascade,
  note         text,
  created_at   timestamptz not null default now(),
  primary key (user_id, question_id)
);
create index if not exists interview_bookmarks_user_idx
  on public.interview_bookmarks (user_id, created_at desc);

alter table public.interview_bookmarks enable row level security;

drop policy if exists "interview_bookmarks_self_select" on public.interview_bookmarks;
create policy "interview_bookmarks_self_select" on public.interview_bookmarks
  for select using (user_id = auth.uid());

drop policy if exists "interview_bookmarks_self_insert" on public.interview_bookmarks;
create policy "interview_bookmarks_self_insert" on public.interview_bookmarks
  for insert with check (user_id = auth.uid());

drop policy if exists "interview_bookmarks_self_update" on public.interview_bookmarks;
create policy "interview_bookmarks_self_update" on public.interview_bookmarks
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "interview_bookmarks_self_delete" on public.interview_bookmarks;
create policy "interview_bookmarks_self_delete" on public.interview_bookmarks
  for delete using (user_id = auth.uid());

-- Admin can read everyone's bookmarks for analytics (optional but harmless)
drop policy if exists "interview_bookmarks_admin_read" on public.interview_bookmarks;
create policy "interview_bookmarks_admin_read" on public.interview_bookmarks
  for select using (public.is_admin());
