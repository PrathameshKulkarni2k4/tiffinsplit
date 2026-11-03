# Environment

> Read when you need to actually run something. Most agent failures that look like reasoning
> failures are environment failures.

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node | 20 | CI pins 20; `npm ci` respects `package-lock.json` |
| npm | bundled with Node | there is no pnpm/yarn config here — do not introduce one |
| Supabase CLI | latest | optional; migrations can be pasted into the SQL editor |

## Setup

```bash
npm ci
cp .env.local.example .env.local   # never commit .env.local
npm run dev
```

## Environment variables

| Variable | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local`, Vercel | safe to expose |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local`, Vercel | safe to expose; RLS is the boundary |

CI defines both to placeholders — the build only needs them to exist, no request is made at build
time.

## Environments

| Environment | App | Database |
|---|---|---|
| Local | `next dev` | local or none |
| Preview / staging | Vercel preview per PR | `tiffinsplit-staging` |
| Production | `tiffinsplit.vercel.app` | `tiffinsplit` |

Migrations go to staging first, then production. `README.md` §"Database changes" has the ordering
rules and the expand/contract guidance; `BACKUPS.md` covers what to do before anything destructive.

## What an agent will not have

- **A Supabase project.** No database, no auth, no RLS testing. Anything touching queries or
  policies has to be verified by a human against staging.
- **The ability to run `next build`** in a constrained sandbox. CI does it.
- **Real env values.** Never invent a project URL or key, and never commit one.

## Known environment failures

| Error | Meaning | Fix |
|---|---|---|
| `npm ci` fails on lockfile mismatch | `package.json` and `package-lock.json` disagree | `npm install` locally, commit the lockfile — this is one of the three things that has broken the project before |
| `Invalid environment variables` at build | missing `NEXT_PUBLIC_*` | copy `.env.local.example` |
| `next build` OOM | sandbox memory limit | run it in CI, not locally; say so in the PR |
