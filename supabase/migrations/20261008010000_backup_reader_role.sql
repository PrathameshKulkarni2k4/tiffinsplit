-- A read-only role for the weekly backup.
--
-- The backup job has to read every row in `public`. Handing it the `postgres`
-- password would work, but that credential can also update, delete, insert and
-- drop -- and it is not subject to Row Level Security, so every policy in the
-- database and the guard trigger from 20261008000000 are irrelevant to it. If
-- that secret leaked, the blast radius is the entire project.
--
-- This role can only read. The worst a leak allows is reading rows the person
-- could already read by signing in and being approved.
--
-- The password is deliberately NOT set here. It is set once, by hand, in the
-- SQL editor, so it never lands in git history or a chat log:
--
--   alter role backup_reader with password '<a long random string>';
--
-- Then build the connection string using the shared pooler. For a custom role
-- the pooler username is [ROLE].[PROJECT-REF], not just the role name:
--
--   postgresql://backup_reader.<PROJECT-REF>:<password>@<POOLER-HOST>:5432/postgres
--
-- Use session mode (port 5432). The direct connection is IPv6-only on the free
-- tier, and GitHub-hosted runners have no IPv6 at all, so a direct string
-- fails with an error that reads like a wrong password.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'backup_reader') then
    create role backup_reader with login;
  end if;
end
$$;

-- Row Level Security is enabled on the tables in `public`, and it applies to
-- this role too. Without this line the grants below still succeed, and pg_dump
-- still exits zero -- but it emits a schema whose tables are all empty. That is
-- the failure mode worth caring about: a backup that looks healthy and restores
-- nothing.
alter role backup_reader bypassrls;

grant usage on schema public to backup_reader;
grant select on all tables in schema public to backup_reader;
grant select on all sequences in schema public to backup_reader;

-- Without these, every table added after today is invisible to the backup and
-- the dump silently stops covering it. New tables must be readable by default.
alter default privileges in schema public
  grant select on tables to backup_reader;
alter default privileges in schema public
  grant select on sequences to backup_reader;
