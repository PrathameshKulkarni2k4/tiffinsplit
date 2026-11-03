## What and why

<One paragraph. The *why* matters more than the *what* — the diff already shows the what.>

Closes #<issue>

## How I verified this

- [ ] `.agent/verify.sh` passes — paste the summary line
- [ ] `--full` run (typecheck, lint, tests, build) if this touches routing, server components or config
- [ ] Staging checked, if this touches RLS, a server action or a query

<If you could not run something, say which and why. "build not run" is allowed. An honest gap
beats a false green.>

## Data impact

- [ ] No schema change
- [ ] Migration added, additive, numbered — applied to staging, and to production after merge
- [ ] Touches RLS — described below

## Review notes

<Trade-off taken, follow-up deferred, a file that looks odd but is deliberate.>

## Checklist

- [ ] One concern per PR
- [ ] New logic in `src/lib/` has a test
- [ ] Money still integer paise; formatted only with `money()`
- [ ] `DESIGN.md` updated if a convention changed
