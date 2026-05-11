-- ============================================================================
-- Migration 009 — faqs
--
-- Replaces the hardcoded faqs constant in lib/data.ts with an admin-managed
-- table. Public reads are open to anon; admin can CRUD. Existing FAQs from
-- lib/data.ts are seeded below so the public surfaces don't go empty.
--
-- category is free-form (e.g. "General", "Payments", "Sessions") and is
-- optional — null = uncategorized. order_index is the manual sort key
-- (lower = earlier); ties break on created_at ascending.
-- ============================================================================

create table if not exists public.faqs (
  id           uuid primary key default gen_random_uuid(),
  question     text not null,
  answer       text not null,
  category     text,
  order_index  integer not null default 100,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists faqs_order_idx on public.faqs (order_index, created_at);

-- Keep updated_at fresh on every UPDATE
create or replace function public.faqs_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists faqs_touch_updated_at on public.faqs;
create trigger faqs_touch_updated_at
  before update on public.faqs
  for each row execute function public.faqs_touch_updated_at();

alter table public.faqs enable row level security;

-- Public read (used by the FAQ page, course detail page, programs page)
drop policy if exists "faqs_anon_read" on public.faqs;
create policy "faqs_anon_read" on public.faqs for select using (true);

-- Admin write
drop policy if exists "faqs_admin_insert" on public.faqs;
create policy "faqs_admin_insert" on public.faqs for insert with check (public.is_admin());

drop policy if exists "faqs_admin_update" on public.faqs;
create policy "faqs_admin_update" on public.faqs for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "faqs_admin_delete" on public.faqs;
create policy "faqs_admin_delete" on public.faqs for delete using (public.is_admin());

-- ============================================================================
-- Seed: the six FAQs that previously lived in lib/data.ts so the public
-- pages keep showing the same content after the cutover.
-- Only inserts when the table is empty so re-running this migration is safe.
-- ============================================================================
insert into public.faqs (question, answer, category, order_index)
select * from (values
  ('Are sessions recorded?', 'Yes — every live class is recorded and added to your dashboard within 24 hours so you can revisit any topic at your own pace.', 'Sessions', 10),
  ('Do you help with job placement?', 'We do not promise placement, but we run a curated job board (only roles tagged to your track), 1:1 resume reviews, and mock interviews with the instructor.', 'Career', 20),
  ('Is there a certificate?', 'Yes — you receive a verifiable certificate of completion once you finish all modules and the capstone exercise.', 'Programs', 30),
  ('How are payments handled?', 'Payments happen off-platform via bank transfer or Interac. After payment, our team manually creates your dashboard account and emails you the credentials.', 'Payments', 40),
  ('Can I take more than one course?', 'Absolutely. Many graduates pair Pharmacovigilance with Regulatory Affairs, or Clinical Research with Data Management. You can apply for additional courses anytime from your dashboard.', 'Programs', 50),
  ('What if I miss a session?', 'Watch the recording and bring questions to the next class — every session opens with a 10-minute Q&A specifically for catch-up.', 'Sessions', 60)
) as seed(question, answer, category, order_index)
where not exists (select 1 from public.faqs);
