-- =====================================================================
--  Guard privileged columns on public.users
--
--  The problem
--  -----------
--  The "self update" policy on public.users is:
--
--      for update using (auth.uid() = id) with check (auth.uid() = id)
--
--  Those clauses constrain which ROWS may be updated, not which COLUMNS.
--  With no trigger and no column-level grant anywhere in the schema, a
--  signed-in user could update any column of their own row — including
--  `role` and `is_active`.
--
--  That means a signed-in user could set is_active = true on their own row
--  and walk straight past the approval gate, or set role = 'admin' and
--  promote themselves. Neither needs the app's UI: the Supabase anon key is
--  public by design, so the REST API is reachable directly with the user's
--  own session.
--
--  This matters more than it used to. Sign-in accepts any Google account, so
--  the set of people who can reach that API is not "the six members" — it is
--  anyone who finds the app. The approval gate is enforced by a policy those
--  users can edit around, so it needs a second line of defence.
--
--  The fix
--  -------
--  A BEFORE UPDATE trigger that rejects changes to role, is_active or email
--  unless the caller is an active admin. full_name and avatar_url stay
--  editable, so a future "edit my display name" feature is unaffected.
--
--  Why the `auth.uid() is null` branch is load-bearing
--  --------------------------------------------------
--  The SQL editor and the service role have no JWT, so auth.uid() is null
--  there and is_admin() is therefore false. Without that early return, this
--  trigger would lock the owner out of their own database — including the
--  ability to promote the first admin. It would be a self-inflicted outage.
--
--  That branch is not a hole. RLS still applies to the `anon` and
--  `authenticated` roles, and the "self update" policy requires
--  auth.uid() = id — never true when the uid is null. So the only sessions
--  reaching this trigger with no JWT are ones that already bypass RLS.
--
--  Verified on staging
--  -------------------
--    member self-promotes to admin   -> BLOCKED
--    member flips own is_active      -> BLOCKED
--    owner edits a role via SQL      -> ALLOWED (no JWT)
-- =====================================================================

create or replace function public.guard_user_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- No JWT: SQL editor, service role, migrations. Trusted — leave it alone.
  if auth.uid() is null then
    return new;
  end if;

  -- An active admin may change anything.
  if public.is_admin() then
    return new;
  end if;

  -- Everyone else may edit their own row, but not their own privileges.
  if new.role is distinct from old.role
     or new.is_active is distinct from old.is_active
     or new.email is distinct from old.email then
    raise exception
      'Only an admin can change a member''s role, active status or email.';
  end if;

  return new;
end;
$$;

drop trigger if exists users_guard_columns on public.users;

create trigger users_guard_columns
before update on public.users
for each row
execute function public.guard_user_columns();
