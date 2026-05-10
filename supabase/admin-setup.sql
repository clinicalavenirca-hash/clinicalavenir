-- ============================================================================
-- Avenir — Promote a user to admin
-- ============================================================================
-- Run this AFTER schema.sql + seed.sql, AFTER you have created the auth user
-- manually in Supabase Studio → Authentication → Users → Add user.
--
-- The handle_new_user trigger from schema.sql automatically creates a row in
-- public.profiles with role='student' the moment the auth user is created.
-- This script flips that one user's role to 'admin'.
--
-- INSTRUCTIONS:
-- 1. In Supabase Studio go to Authentication → Users → Add user.
--    Tick "Auto Confirm User" so they don't have to click an email link.
--    Email:    your-admin-email@example.com
--    Password: any strong password
-- 2. Replace the email below with the one you just created.
-- 3. Run this script in the SQL editor.
-- ============================================================================

update public.profiles
set role = 'admin'
where lower(email) = lower('REPLACE_WITH_YOUR_ADMIN_EMAIL@example.com');

-- Verify it worked:
select id, email, role, name, joined_at
from public.profiles
where role = 'admin';
