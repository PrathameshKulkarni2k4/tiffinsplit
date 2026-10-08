# Backups

How the database is backed up, where the backups live, and what to do when
something goes wrong.

## What runs

`.github/workflows/backup.yml` runs a `pg_dump` of the `public` schema, encrypts
it, and stores it as a workflow artifact.

- **Every Sunday at 02:00 UTC**, plus a manual button.
- The weekly connection also counts as database activity, which stops the free
  Supabase project from pausing after seven days of inactivity.
- Artifacts are kept for **90 days**. This is a rolling window, not an archive.

## Where a backup lives

On GitHub, attached to the run that made it — **not** committed into the
repository.

**Actions → Backup → click the run → Artifacts → `tiffinsplit-backup-<run id>`**

Download the zip; inside is a single `tiffinsplit-YYYY-MM-DD.sql.gz.gpg`.

Deleting the run deletes the backup.

## The two secrets

Both live in **Settings → Secrets and variables → Actions**.

| Secret | What it is | If you lose it |
| --- | --- | --- |
| `SUPABASE_DB_URL` | Connects as the read-only `backup_reader` role | Reset the role's password and rebuild the string. Costs nothing. |
| `BACKUP_PASSPHRASE` | Encrypts the dump | **The existing backups become permanently unreadable.** |

`SUPABASE_DB_URL` uses the shared pooler in **session mode** (port 5432). For a
custom role the pooler username is `[ROLE].[PROJECT-REF]`, not the bare role
name. The direct connection is IPv6-only on the free tier and GitHub runners
have no IPv6, so a direct string will not work.

`BACKUP_PASSPHRASE` is used by the workflow automatically. You only ever type it
yourself when restoring.

## Restoring

> **Restore into staging first, never straight into production.** A restore
> overwrites whatever it is pointed at.

**1. Get the file.** Download the artifact from the run, and unzip it.

**2. Decrypt it.** You will be asked for the passphrase.

```bash
gpg --decrypt tiffinsplit-2026-10-08.sql.gz.gpg > dump.sql.gz
gunzip dump.sql.gz
```

**3. Load it.** This needs a credential that can *write* — the `postgres`
connection string for the target project. `backup_reader` cannot do this, by
design.

```bash
psql "postgresql://postgres.<PROJECT-REF>:<password>@<POOLER-HOST>:5432/postgres" \
  -v ON_ERROR_STOP=1 -f dump.sql
```

**The target must have no existing tables in `public`**, because the dump
contains `CREATE TABLE` statements and will stop on the first name that already
exists. To restore over an existing database, clear it first:

```sql
-- Destructive. Everything in the public schema is deleted.
drop schema public cascade;
create schema public;
```

**4. Re-apply the grants.** The dump is written with `--no-owner
--no-privileges`, so it carries the tables, the data and the Row Level Security
policies, but **not** the `GRANT` statements that let Supabase's `anon` and
`authenticated` roles reach the tables. Without them the app will connect and
see nothing. Re-apply the grants from the migrations in `supabase/migrations/`,
or from Supabase's default privileges.

## What the backup does not contain

- **Auth users and sessions.** These live in the `auth` schema, which Supabase
  manages and which cannot be restored from a dump anyway. If they were lost,
  everyone would sign in again and be re-approved.
- **Grant statements**, for the reason above.
- **Anything outside the `public` schema.**

## Rules that keep it working

- **Keep a copy of `BACKUP_PASSPHRASE`** in a password manager. Unlike the
  database password it cannot be reset, and without it the backups are useless.
- **If you ever change it, keep the old one too.** Existing artifacts were
  encrypted with the old passphrase; replacing the secret does not re-key them.
- **The `pg_dump` client is pinned to PostgreSQL 17** in the workflow, matching
  the server. If Supabase upgrades the project to 18, the job fails loudly
  naming both versions, and the fix is bumping the version in the install step.
- **A backup you have never restored is not yet a backup.** Restore one into
  staging periodically.

## How the job protects itself

Each step exists because something went wrong once:

- **Row-count check** — a dump that exits zero but contains no rows is the
  dangerous failure, because it looks healthy and restores nothing. The job
  fails if every table is empty.
- **Version assertion** — installing the right client does not change which
  `pg_dump` runs, so the step checks the version it will actually use.
- **Encryption before upload** — the repository is public, so an unencrypted
  artifact would be readable by anyone. The plain file is deleted before the
  upload step, so it cannot be published by mistake.
