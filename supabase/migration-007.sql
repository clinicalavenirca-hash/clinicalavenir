-- ============================================================================
-- Migration 007 — contact_messages
--
-- WHY: the public Contact form previously discarded submissions client-side.
-- This table captures them so admin can triage from /admin/messages.
--
-- - Anyone (anon) can INSERT a row via the form action.
-- - Only admins can SELECT / UPDATE / DELETE (read inbox, mark as handled).
-- - status column tracks lifecycle: new → read → replied → archived.
-- ============================================================================

create table if not exists public.contact_messages (
  id           uuid primary key default gen_random_uuid(),
  full_name    text not null,
  email        text not null,
  phone        text,
  country_code text,
  topic        text,
  message      text not null,
  status       text not null default 'new'
    check (status in ('new', 'read', 'replied', 'archived')),
  created_at   timestamptz not null default now()
);

create index if not exists contact_messages_status_idx
  on public.contact_messages (status, created_at desc);

alter table public.contact_messages enable row level security;

-- Anyone (incl. anon) can submit a message via the form
drop policy if exists "contact_messages_anon_insert" on public.contact_messages;
create policy "contact_messages_anon_insert"
  on public.contact_messages for insert
  with check (true);

-- Only admins read / update / delete
drop policy if exists "contact_messages_admin_read" on public.contact_messages;
create policy "contact_messages_admin_read"
  on public.contact_messages for select
  using (public.is_admin());

drop policy if exists "contact_messages_admin_write" on public.contact_messages;
create policy "contact_messages_admin_write"
  on public.contact_messages for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "contact_messages_admin_delete" on public.contact_messages;
create policy "contact_messages_admin_delete"
  on public.contact_messages for delete
  using (public.is_admin());
