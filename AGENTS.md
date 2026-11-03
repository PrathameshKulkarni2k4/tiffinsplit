# AGENTS.md — tiffinsplit

Canonical entry point for any AI agent working here — Claude Code, Sarvam, Cursor, Codex.

**`DESIGN.md` is the conventions document. This file is the index.** Do not copy rules out of
`DESIGN.md` into here; read it. It is 165 lines and it is unusually good — it records which
choices are load-bearing and which are deliberate, which is exactly what an agent otherwise
"improves" away.

TiffinSplit splits mess tiffin bills for six colleagues: orders, equal splits to the paise, and
what each person owes each mess. Next.js 14 App Router + Supabase + Vercel, all free tiers.

---

## 0. Starting a session

1. `DESIGN.md` — the domain rules, the invariants, the styling constraints. Read all of it.
2. `README.md` — setup, the approval gate, environments, migrations.
3. `.agent/context/phase.md` — what is built, what is next, what is deliberately not built.
4. Run `.agent/verify.sh` **before** you change anything. If it is already red, say so — do not
   start work on top of a broken baseline.

For anything spanning more than one file, write the plan first (`.agent/commands/plan.md`).

## 1. Commands

| Task | Command |
|---|---|
| Install | `npm ci` |
| Dev server | `npm run dev` |
| **Verify (typecheck + lint + tests)** | `.agent/verify.sh` |
| Inner loop | `.agent/verify.sh --fast` |
| Full, including build | `.agent/verify.sh --full` |
| One test file | `npx vitest run tests/billing.test.ts` |
| Typecheck alone | `npm run typecheck` |

`.agent/verify.sh` mirrors `.github/workflows/ci.yml` step for step. If you change one, change
both in the same PR.

## 2. Layout

```
src/app/            routes, pages, loading/error boundaries; server actions in */actions.ts
src/components/     app components; components/ui is hand-managed shadcn
src/lib/            billing, split, data, aggregate, format, auth — the tested core
tests/              vitest, node environment, pure logic only
supabase/           migrations (source of truth), schema.sql, seed.sql, approval_gate.sql
```

`DESIGN.md` §"Code layout" has the per-module function list. Trust it over this file.

## 3. Conventions that are NOT obvious

All of these are in `DESIGN.md` — listed here only because an agent will break them without
reading it:

- **Money is integer paise** everywhere internal. Format only at the edge with `money()`.
  Never a float, never a `number` that means rupees.
- **`todayISO()` is IST-aware.** Never `new Date().toISOString()` for the business date.
- **The price snapshot rule.** `orders.unit_price` and `order_shares.share_amount` are written at
  log time; bills read the stored values, never the mess's current price.
- **`--ui-` token prefix is load-bearing.** Dropping it collides with the app palette.
- **Breakpoints are 721px and 900px**, replacing Tailwind's defaults on purpose.
- **Selects stay native.** Do not "upgrade" them to Radix Select.
- Server Components by default; mutations are server actions.

## 4. Traps

- **The app must never guess who takes the half.** In `pairs` mode with an odd number present,
  confirmation is blocked until a person is chosen. A rotation suggestion was explicitly
  rejected — do not reintroduce one.
- **RLS is the security boundary, not the UI.** A page that hides data is not access control. Any
  change to what a user can read belongs in a migration, not a component.
- **Migrations are additive and applied in order**, staging then production. Never bundle a
  destructive migration with the feature that needs it — there are no backups on the free plan.
  See `BACKUPS.md`.
- **`globals.css` classes can shadow Tailwind utilities silently**, because they come after
  `@tailwind utilities`. Check before adding a class.
- **`next build` does not run in a development sandbox.** CI runs it; a Vercel preview is the
  first real build otherwise. Do not conclude a change is fine because it typechecks.

## 5. Definition of done

1. `.agent/verify.sh` passes (typecheck, lint, tests). Add `--full` when the change touches
   routing, server components or config — the build is the only check that catches some breakage.
2. New logic in `src/lib/` has a test in `tests/`. Split and billing arithmetic is the most
   valuable place to add one.
3. A schema change ships as a new numbered migration, never an edit to an applied one.
4. No unrelated reformatting.
5. `DESIGN.md` updated if a convention changed — it is the record, and a stale record is worse
   than none.

## 6. Rules for agents

- Branch, never `main`. Open a PR; a human merges. Never force-push.
- One concern per PR. A build failure should point at one thing.
- Do not add a dependency without asking. The list is small and deliberately so.
- **Never claim a check passed if you did not run it.** If you could not run the build, say
  "build not run" in the PR body.
- If the task needs information you do not have — a reproduction, a schema decision, a design
  call — stop and ask. A confident guess costs more than a question.

## 7. Where to look next

| File | Read when |
|---|---|
| `DESIGN.md` | always, before touching domain logic or styles |
| `README.md` | setup, environments, the approval gate, migrations |
| `BACKUPS.md` | anything touching schema, migrations or data |
| `.agent/context/testing-map.md` | writing or moving a test |
| `.agent/context/env.md` | you need to actually run something |
| `.agent/decisions/` | you are about to change a design choice |

## 8. Briefing an agent on a task

```
Goal:        one sentence, in terms of user-visible behaviour
Scope:       files or modules this should touch
Not in scope: what must not change
Acceptance:  how we know it works — the command, or the manual steps
Constraints: deadlines, compatibility, things already tried
```

"Improve the bills page" produces a plausible diff that is not what you wanted. Those five lines
produce a reviewable one.
