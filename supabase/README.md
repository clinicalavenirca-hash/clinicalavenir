# Avenir Supabase setup

Three SQL files. Run them **in this order** in Supabase Studio → SQL editor.

| Order | File | What it does |
|------:|------|--------------|
| 1 | [`schema.sql`](./schema.sql) | All tables, indexes, triggers (incl. `handle_new_user`), RLS policies (incl. `is_admin()` helper + admin policies), realtime publication, storage buckets + storage policies. **Idempotent — safe to re-run.** |
| 2 | [`seed.sql`](./seed.sql) | Inserts the instructor (Gopal Chelikani), the 4 default course tracks, and 3 placeholder graduate stories. **Idempotent.** |
| 3 | [`admin-setup.sql`](./admin-setup.sql) | Promotes one user to `role='admin'`. **Run after** you've manually created the auth user. |

## Step-by-step

### 1. Run `schema.sql`
Open Supabase Studio → SQL editor → paste the contents → Run.
This creates every table, all RLS policies, realtime channels, and the four storage buckets (`course-covers`, `instructor-photos`, `story-avatars`, `student-avatars`).

### 2. Run `seed.sql`
Same flow. Populates the marketing surfaces with real content so the home page and `/courses` aren't empty on first load.

### 3. Turn off email confirmation (one-time, in dashboard)
Authentication → Settings → toggle **Enable email confirmations** OFF.
This matches the spec — admin creates accounts manually and emails the credentials, so students sign in directly without confirming.

### 4. Create your admin account
Authentication → Users → **Add user**
- Email: your real admin email
- Password: a strong password
- ✅ tick **Auto Confirm User**

The `handle_new_user` trigger automatically creates a `public.profiles` row with role `student`.

### 5. Promote yourself to admin
Open `admin-setup.sql`, replace `REPLACE_WITH_YOUR_ADMIN_EMAIL@example.com` with the email from step 4, paste into the SQL editor, and Run. The verify query at the bottom should return your row with `role = 'admin'`.

### 6. Sign in
- Visit `/admin-login`, sign in with the credentials → you land on `/admin/dashboard`.
- Visit `/login` for student sign-in once you've created student accounts (via the admin dashboard).

## Storage buckets

All four are public-read so the marketing site can render images without auth tokens.

| Bucket | Who uploads | Used for |
|---|---|---|
| `course-covers` | Admin | Course thumbnail images on the catalog + detail pages |
| `instructor-photos` | Admin | The "Meet your instructor" portrait |
| `story-avatars` | Admin | Graduate testimonial photos on the home page |
| `student-avatars` | The student themselves | Optional profile photo on `/student/profile` |

## When you change schema later

Append to `schema.sql` and re-run — every `create table` is `if not exists`, every policy uses `drop policy if exists … create policy …`, every trigger uses `drop trigger if exists`. Re-running is non-destructive.

For data changes, edit `seed.sql` — every insert uses `on conflict (id) do update set …` so re-running refreshes rows without duplicating.
