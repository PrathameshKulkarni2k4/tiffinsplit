# Testing map

> Read before writing or moving a test, so you extend rather than duplicate.

## What is tested

Vitest, `node` environment, `tests/**/*.test.ts` only — no jsdom, no component rendering.

| Test | Subject |
|---|---|
| `tests/billing.test.ts` | `src/lib/billing.ts` — `splitEqually`, `round`, `sumShares`, `personMonthlyTotals`, `messMonthlyTotals` |
| `tests/split.test.ts` | `src/lib/split.ts` — `planGroup`, `planTotal`, `planPerPerson`, `SplitMode` |
| `tests/basket.test.ts` | `src/lib/basket.ts` |

The billing and split arithmetic is the heart of the app: largest-remainder splitting so parts sum
to the whole exactly. That is where a new test earns the most.

## What cannot be tested here, and what to do instead

- **Row-level security and the approval gate.** Enforced in the database; verified by applying the
  migration and querying as a non-approved user. A component test would prove nothing.
- **Server actions and route handlers** — need a running Supabase. Exercise them against the
  staging project.
- **React Server Components / pages** — no jsdom harness exists, and adding one is a bigger
  decision than the test usually warrants.
- **`next build`** — does not run in a development sandbox. CI runs it. Say "build not run" if you
  could not.

## Where a new test goes

Pure logic → `tests/<module>.test.ts`, importing from `@/lib/...` (the `@` alias is configured in
`vitest.config.ts`). If the logic you want to test is tangled into a server action or a component,
that is a signal to extract it into `src/lib/` rather than to add a rendering harness.

## Running

```
npx vitest run                      # all
npx vitest run tests/billing.test.ts
npx vitest                            # watch
```
