-- ============================================================================
-- Migration 013: Create resumes table for storing student resumes
-- ============================================================================

-- Add apply_url column to jobs if it doesn't exist
alter table public.jobs
add column if not exists apply_url text;

-- Create resumes table
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  pdf_name text not null,
  content text,                                    -- JSON string of resume data
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists resumes_user_idx on public.resumes(user_id);

-- Enable RLS
alter table public.resumes enable row level security;

-- Students manage their own resumes
drop policy if exists "resumes_self" on public.resumes;
create policy "resumes_self" on public.resumes 
  for all using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

-- Add touch-updated-at trigger
drop trigger if exists resumes_touch on public.resumes;
create trigger resumes_touch before update on public.resumes
  for each row execute procedure public.tg_touch_updated_at();
