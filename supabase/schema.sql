-- ============================================================================
-- Avenir — Supabase schema
-- Run this once in the Supabase SQL editor against your project.
-- Then run seed.sql to populate initial data.
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- TOUCH-UPDATED-AT TRIGGER (shared)
-- ----------------------------------------------------------------------------
create or replace function public.tg_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ============================================================================
-- 1. COURSES
-- ============================================================================
create table if not exists public.courses (
  id text primary key,
  slug text unique not null,
  title text not null,
  tagline text not null default '',
  cover text not null default '',                 -- public URL of uploaded cover image
  short_description text not null default '',
  duration text not null default '',
  timings text not null default '',
  certificate boolean not null default false,
  registration_start date,
  registration_end date,
  cohort_start date,
  total_seats integer not null default 0,
  seats_remaining integer not null default 0,
  best_for text not null default '',
  what_you_will_learn jsonb not null default '[]'::jsonb,
  audience text not null default '',
  color text not null default 'from-brand-600 to-brand-800',
  schedule jsonb not null default '{}'::jsonb,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists courses_cohort_start_idx on public.courses(cohort_start);
create index if not exists courses_published_idx on public.courses(is_published) where is_published = true;
drop trigger if exists courses_touch on public.courses;
create trigger courses_touch before update on public.courses
  for each row execute procedure public.tg_touch_updated_at();

-- ============================================================================
-- 2. INSTRUCTOR (single-row table)
-- ============================================================================
create table if not exists public.instructor (
  id text primary key default 'default',
  name text not null,
  title text not null,
  photo text not null,                            -- public URL of uploaded photo
  short_bio text not null,
  long_bio text not null,
  years_experience integer not null,
  role_label text not null,                       -- e.g. "Study Coordinator" (avoids the reserved keyword `current_role`)
  current_company text not null,
  location text not null,
  education text not null,
  specialization text not null,
  past_companies text[] not null default '{}',
  updated_at timestamptz not null default now()
);
drop trigger if exists instructor_touch on public.instructor;
create trigger instructor_touch before update on public.instructor
  for each row execute procedure public.tg_touch_updated_at();

-- ============================================================================
-- 3. STORIES (graduate testimonials, admin-managed)
-- ============================================================================
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  placement text not null,
  quote text not null,
  avatar text,                                    -- public URL or null
  order_index integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists stories_order_idx on public.stories(order_index);
drop trigger if exists stories_touch on public.stories;
create trigger stories_touch before update on public.stories
  for each row execute procedure public.tg_touch_updated_at();

-- ============================================================================
-- 4. APPLICATIONS (apply form submissions; pre-account)
-- ============================================================================
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  country_code text,
  country text,
  city text,
  address text,
  course_slugs text[] not null default '{}',
  message text,
  status text not null default 'new' check (status in ('new','contacted','paid','declined')),
  is_existing boolean not null default false,
  internal_notes text,
  auth_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists applications_status_idx on public.applications(status);
create index if not exists applications_email_idx on public.applications(lower(email));
create index if not exists applications_auth_user_idx on public.applications(auth_user_id);
drop trigger if exists applications_touch on public.applications;
create trigger applications_touch before update on public.applications
  for each row execute procedure public.tg_touch_updated_at();

-- ============================================================================
-- 5. PROFILES (extends auth.users; one row per student)
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  phone text,
  country_code text,
  country text,
  city text,
  address text,
  avatar text,                                    -- public URL of uploaded avatar (optional)
  role text not null default 'student' check (role in ('student','admin')),
  status text not null default 'active' check (status in ('active','inactive')),
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profiles_email_idx on public.profiles(lower(email));
drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute procedure public.tg_touch_updated_at();

-- When a student is signed up via auth.admin.createUser, the user_metadata
-- carries the application snapshot. This trigger materialises it into profiles.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, name, email, phone, country_code, country, city, address, role)
  values (
    new.id,
    coalesce(meta->>'name', split_part(new.email, '@', 1)),
    new.email,
    meta->>'phone',
    meta->>'country_code',
    meta->>'country',
    meta->>'city',
    meta->>'address',
    coalesce(meta->>'role', 'student')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- 6. ENROLLMENTS (student → courses)
-- ============================================================================
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);
create index if not exists enrollments_user_idx on public.enrollments(user_id);

-- ============================================================================
-- 7. MODULES & VIDEOS (course curriculum)
-- ============================================================================
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  week_label text,
  topics jsonb not null default '[]'::jsonb,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists modules_course_idx on public.modules(course_id, order_index);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  youtube_id text not null,                       -- only YouTube IDs / URLs for video
  duration_label text,
  description text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists videos_module_idx on public.videos(module_id, order_index);

-- ============================================================================
-- 8. PROGRESS TRACKING (per-student watch + completion state)
-- ============================================================================
create table if not exists public.video_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  watched_at timestamptz not null default now(),
  primary key (user_id, video_id)
);
create index if not exists video_progress_user_idx on public.video_progress(user_id);

create table if not exists public.module_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, module_id)
);
create index if not exists module_progress_user_idx on public.module_progress(user_id);

-- ============================================================================
-- 9. LEARNING STATUS VIEW (admin-side aggregate)
--    One row per (user, enrolled course) with totals + watched counts.
--    `security_invoker = true` makes the view respect the *caller's* RLS, so:
--      • students see only their own row (matches their self-RLS on
--        enrollments / video_progress / module_progress)
--      • admins see everyone's via the admin policies on those tables
--    Without it, the view would run with the creator's privileges and bypass
--    RLS entirely — that's what Supabase's linter is warning about.
-- ============================================================================
create or replace view public.learning_status
with (security_invoker = true) as
with module_totals as (
  select course_id, count(*) as modules_total from public.modules group by course_id
),
video_totals as (
  select m.course_id, count(v.id) as videos_total
  from public.modules m left join public.videos v on v.module_id = m.id
  group by m.course_id
)
select
  e.user_id,
  c.id   as course_id,
  c.slug as course_slug,
  c.title as course_title,
  coalesce(mt.modules_total, 0) as modules_total,
  coalesce(vt.videos_total,  0) as videos_total,
  (
    select count(*) from public.module_progress mp
    join public.modules m on m.id = mp.module_id
    where mp.user_id = e.user_id and m.course_id = c.id
  ) as modules_completed,
  (
    select count(*) from public.video_progress vp
    join public.videos v on v.id = vp.video_id
    join public.modules m on m.id = v.module_id
    where vp.user_id = e.user_id and m.course_id = c.id
  ) as videos_watched,
  (
    select max(vp.watched_at) from public.video_progress vp
    join public.videos v on v.id = vp.video_id
    join public.modules m on m.id = v.module_id
    where vp.user_id = e.user_id and m.course_id = c.id
  ) as last_watched_at
from public.enrollments e
join public.courses c on c.id = e.course_id
left join module_totals mt on mt.course_id = c.id
left join video_totals  vt on vt.course_id = c.id;

-- ============================================================================
-- 10. JOBS  (for student-side job board; admin-managed)
-- ============================================================================
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  course_slug text not null references public.courses(slug) on delete cascade,
  city text,
  country text,
  type text,
  seniority text,
  salary text,
  salary_min integer,
  salary_max integer,
  salary_period text default 'year' check (salary_period in ('year','hour')),
  deadline date,
  entry_level_friendly boolean not null default false,
  description text,
  qualifications jsonb not null default '[]'::jsonb,
  is_published boolean not null default true,
  posted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists jobs_touch on public.jobs;
create trigger jobs_touch before update on public.jobs
  for each row execute procedure public.tg_touch_updated_at();

-- Job applications (student → job)
create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  resume_snapshot jsonb,
  status text not null default 'applied' check (status in ('applied','interview','offer','rejected')),
  notes text,
  follow_up_date date,
  applied_at timestamptz not null default now(),
  unique (user_id, job_id)
);
create index if not exists job_apps_user_idx on public.job_applications(user_id);

-- ============================================================================
-- ROW-LEVEL SECURITY
-- ============================================================================
alter table public.courses          enable row level security;
alter table public.instructor       enable row level security;
alter table public.stories          enable row level security;
alter table public.applications     enable row level security;
alter table public.profiles         enable row level security;
alter table public.enrollments      enable row level security;
alter table public.modules          enable row level security;
alter table public.videos           enable row level security;
alter table public.video_progress   enable row level security;
alter table public.module_progress  enable row level security;
alter table public.jobs             enable row level security;
alter table public.job_applications enable row level security;

-- Public reads for marketing surfaces
drop policy if exists  "courses_public_read"     on public.courses;
create policy          "courses_public_read"     on public.courses     for select using (is_published);
drop policy if exists  "instructor_public_read"  on public.instructor;
create policy          "instructor_public_read"  on public.instructor  for select using (true);
drop policy if exists  "stories_public_read"     on public.stories;
create policy          "stories_public_read"     on public.stories     for select using (true);
drop policy if exists  "jobs_published_read"     on public.jobs;
create policy          "jobs_published_read"     on public.jobs        for select using (is_published);

-- Profiles: own row + admins
drop policy if exists "profiles_self_read"   on public.profiles;
create policy "profiles_self_read"  on public.profiles  for select using (auth.uid() = id);
drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = id);

-- Enrollments: students see only their own
drop policy if exists "enrollments_self_read" on public.enrollments;
create policy "enrollments_self_read" on public.enrollments for select using (auth.uid() = user_id);

-- Progress tables: students manage their own
drop policy if exists "video_progress_self" on public.video_progress;
create policy "video_progress_self" on public.video_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "module_progress_self" on public.module_progress;
create policy "module_progress_self" on public.module_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Job applications: students manage their own
drop policy if exists "job_apps_self" on public.job_applications;
create policy "job_apps_self" on public.job_applications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Modules / videos: read for any authenticated student enrolled in the course
drop policy if exists "modules_enrolled_read" on public.modules;
create policy "modules_enrolled_read" on public.modules for select using (
  exists (select 1 from public.enrollments e where e.user_id = auth.uid() and e.course_id = modules.course_id)
);
drop policy if exists "videos_enrolled_read" on public.videos;
create policy "videos_enrolled_read" on public.videos for select using (
  exists (
    select 1 from public.modules m
    join public.enrollments e on e.course_id = m.course_id
    where m.id = videos.module_id and e.user_id = auth.uid()
  )
);

-- Anyone can submit an application (signed-out visitor)
drop policy if exists "applications_public_insert" on public.applications;
create policy "applications_public_insert" on public.applications for insert with check (true);

-- Logged-in students can read applications they submitted (matched by email),
-- so they can see admin's accept / decline decision on their dashboard.
drop policy if exists "applications_self_read" on public.applications;
create policy "applications_self_read" on public.applications
  for select using (lower(email) = lower(auth.jwt() ->> 'email'));

-- ============================================================================
-- ADMIN ACCESS — security-definer helper avoids RLS recursion when the policy
-- itself queries profiles to check the caller's role.
-- ============================================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  -- Reads the role from the JWT first (set by the sync trigger above) so RLS
  -- policies don't trigger a profile lookup on every query. Falls back to
  -- profiles only for sessions whose JWT pre-dates the trigger.
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- profiles
drop policy if exists "profiles_admin_read"   on public.profiles;
create policy "profiles_admin_read"   on public.profiles   for select using (public.is_admin());
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles   for update using (public.is_admin());
drop policy if exists "profiles_admin_delete" on public.profiles;
create policy "profiles_admin_delete" on public.profiles   for delete using (public.is_admin());

-- applications
drop policy if exists "applications_admin_read"   on public.applications;
create policy "applications_admin_read"   on public.applications for select using (public.is_admin());
drop policy if exists "applications_admin_update" on public.applications;
create policy "applications_admin_update" on public.applications for update using (public.is_admin());
drop policy if exists "applications_admin_delete" on public.applications;
create policy "applications_admin_delete" on public.applications for delete using (public.is_admin());

-- enrollments (admin can read all + create/delete enrollments when minting accounts)
drop policy if exists "enrollments_admin_all" on public.enrollments;
create policy "enrollments_admin_all" on public.enrollments
  for all using (public.is_admin()) with check (public.is_admin());

-- courses, instructor, stories, modules, videos, jobs — admin can write everything
drop policy if exists "courses_admin_all"    on public.courses;
create policy "courses_admin_all"    on public.courses    for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "instructor_admin_all" on public.instructor;
create policy "instructor_admin_all" on public.instructor for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "stories_admin_all"    on public.stories;
create policy "stories_admin_all"    on public.stories    for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "modules_admin_all"    on public.modules;
create policy "modules_admin_all"    on public.modules    for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "videos_admin_all"     on public.videos;
create policy "videos_admin_all"     on public.videos     for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "jobs_admin_all"       on public.jobs;
create policy "jobs_admin_all"       on public.jobs       for all using (public.is_admin()) with check (public.is_admin());

-- job applications — admin reads everyone's, admin can move pipeline state
drop policy if exists "job_apps_admin_read"   on public.job_applications;
create policy "job_apps_admin_read"   on public.job_applications for select using (public.is_admin());
drop policy if exists "job_apps_admin_update" on public.job_applications;
create policy "job_apps_admin_update" on public.job_applications for update using (public.is_admin());
drop policy if exists "job_apps_admin_delete" on public.job_applications;
create policy "job_apps_admin_delete" on public.job_applications for delete using (public.is_admin());

-- progress tables — admin reads everyone's
drop policy if exists "video_progress_admin_read"  on public.video_progress;
create policy "video_progress_admin_read"  on public.video_progress  for select using (public.is_admin());
drop policy if exists "module_progress_admin_read" on public.module_progress;
create policy "module_progress_admin_read" on public.module_progress for select using (public.is_admin());

-- Note: the app may also use the SUPABASE_SERVICE_ROLE_KEY from server-side
-- code (admin user creation, password reset, account deletion). Service role
-- bypasses every policy above by design — keep that key server-side only.

-- ============================================================================
-- REALTIME — enable Postgres changes feed for marketing-facing tables
-- ============================================================================
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime add table public.courses;          exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.instructor;       exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.stories;          exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.applications;     exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.profiles;         exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.jobs;             exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.job_applications; exception when duplicate_object then null; end;
  end if;
end $$;

-- ============================================================================
-- STORAGE BUCKETS (image-only; videos are YouTube links elsewhere)
--   - course-covers     : public, admin-uploaded course thumbnails
--   - instructor-photos : public, instructor portrait
--   - story-avatars     : public, graduate testimonial photos
--   - student-avatars   : public, student profile photos (uploaded by student)
-- ============================================================================
insert into storage.buckets (id, name, public)
values
  ('course-covers',     'course-covers',     true),
  ('instructor-photos', 'instructor-photos', true),
  ('story-avatars',     'story-avatars',     true),
  ('student-avatars',   'student-avatars',   true)
on conflict (id) do update set public = excluded.public;

-- Public read policies (anon + authenticated can SELECT objects)
drop policy if exists "Public read course-covers"     on storage.objects;
create policy "Public read course-covers"     on storage.objects for select to anon, authenticated using (bucket_id = 'course-covers');
drop policy if exists "Public read instructor-photos" on storage.objects;
create policy "Public read instructor-photos" on storage.objects for select to anon, authenticated using (bucket_id = 'instructor-photos');
drop policy if exists "Public read story-avatars"     on storage.objects;
create policy "Public read story-avatars"     on storage.objects for select to anon, authenticated using (bucket_id = 'story-avatars');
drop policy if exists "Public read student-avatars"   on storage.objects;
create policy "Public read student-avatars"   on storage.objects for select to anon, authenticated using (bucket_id = 'student-avatars');

-- Authenticated insert into student-avatars (students upload their own)
drop policy if exists "Students upload own avatar" on storage.objects;
create policy "Students upload own avatar"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'student-avatars');

drop policy if exists "Students update own avatar" on storage.objects;
create policy "Students update own avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'student-avatars');

drop policy if exists "Students delete own avatar" on storage.objects;
create policy "Students delete own avatar"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'student-avatars');

-- Admin uploads — browser-side admin uses anon key + their session cookie,
-- so we need explicit RLS letting role='admin' write to admin-managed buckets.
-- (The service role key bypasses these anyway.)
drop policy if exists "Admin write course-covers" on storage.objects;
create policy "Admin write course-covers" on storage.objects
  for all to authenticated
  using (bucket_id = 'course-covers' and public.is_admin())
  with check (bucket_id = 'course-covers' and public.is_admin());

drop policy if exists "Admin write instructor-photos" on storage.objects;
create policy "Admin write instructor-photos" on storage.objects
  for all to authenticated
  using (bucket_id = 'instructor-photos' and public.is_admin())
  with check (bucket_id = 'instructor-photos' and public.is_admin());

drop policy if exists "Admin write story-avatars" on storage.objects;
create policy "Admin write story-avatars" on storage.objects
  for all to authenticated
  using (bucket_id = 'story-avatars' and public.is_admin())
  with check (bucket_id = 'story-avatars' and public.is_admin());
