-- =====================================================================
--  Approval gate migration
--  Run this ONLY if you already ran an earlier version of schema.sql.
--  Fresh installs already include the approval gate - skip this file.
-- =====================================================================

-- 1) New sign-ins start inactive (pending) instead of active.
alter table public.users alter column is_active set default false;

-- 2) Let a pending user read their own row so the app can say "awaiting approval".
drop policy if exists "self read" on public.users;
create policy "self read" on public.users for select using (auth.uid() = id);

-- 3) Optional: re-gate everyone who is not an admin.
--    Review this before running - it locks out existing members until an
--    admin approves them from the Members page.
-- update public.users set is_active = false where role <> 'admin';
