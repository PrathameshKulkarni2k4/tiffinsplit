# TiffinSplit — design & conventions

Notes for anyone (human or agent) changing this app. Read this first: a few
of these rules are load-bearing, and a couple of them look like stylistic
choices but are actually correctness constraints.

## The domain

Six colleagues split mess tiffin bills. Rules the UI must respect:

- Tiffins are afternoon meals. Prices are **per mess** — full ₹90 / half ₹65
  by default, editable per mess.
- **Splits are always equal.** Money is held as integer paise and divided with
  a largest-remainder split, so the parts always sum to the whole exactly.
- One person pays the mess; the others reimburse them.
- Many messes, changing often. **One person eats from exactly one mess per
  day** — the Today screen enforces this by moving someone between groups
  rather than letting them appear twice.

### How a group is actually split

In the real world people **pair up and share a full tiffin**. If one person is
left over, that person **takes a half alone**. Two modes:

- `pairs` (default) — "Pairs share a full"
- `all-half` — "All take a half"

**The app must never guess who takes the half.** In `pairs` mode with an odd
number present, confirmation is blocked until someone is picked. This was
explicitly requested and a "rotation" suggestion was explicitly rejected —
do not reintroduce one.

### The price snapshot rule

`orders.unit_price` and `order_shares.share_amount` are written **at log
time**. Bills and the messes-owed page read those stored values and never the
mess's current price. Changing a mess price therefore affects only *future*
orders, and past bills never move.

This is why the Messes page carries a note about it — and it is the single
most important invariant to preserve. Any future "edit an order" feature must
keep it.

## Design tokens

The palette is a handful of hex values in `globals.css`. shadcn wants its
tokens as HSL triplets, and it wants names — `--card`, `--muted`, `--good`,
`--warn` — that this app's palette was already using for its own hex values.

So the shadcn tokens are namespaced **`--ui-`**. That prefix is load-bearing,
not decoration: dropping it would collide with the app palette and break
whatever still reads those variables. Components still use the ordinary
`bg-card` / `text-muted-foreground` class names; only the variable behind them
differs.

| Token | Value | Comes from |
|---|---|---|
| `--ui-background` | `222.9 46.7% 97.1%` | `--bg` #f4f6fb |
| `--ui-foreground` | `220.8 32.5% 15.1%` | `--ink` #1a2233 |
| `--ui-primary` | `221.2 83.2% 53.3%` | `--brand` #2563eb |
| `--ui-card` | `0 0% 100%` | white |
| `--ui-muted-foreground` | `220 8.9% 46.1%` | grey text |
| `--ui-border` / `--ui-input` | `222 23.8% 91.8%` | hairlines |
| `--ui-good` | `142.4 71.8% 29.2%` | success |
| `--ui-warn` | `26 90.5% 37.1%` | half / inactive |
| `--ui-radius` | `0.625rem` | 10px |

## Breakpoints

The stylesheet has always switched at **721px** (mobile edge) and **900px**
(wide desktop). Tailwind's `screens` are set to match — `sm` 480, `md` 721,
`lg` 900 — which **replaces** Tailwind's defaults on purpose, so migrated and
un-migrated code responds at the same widths. Prefer `max-md:` for
mobile-only rules so the two agree.

## Styling

`globals.css` holds only three things now: the Tailwind layers, the tokens
above, and base document styles (`body`, `a`, `h1`, `h2`, `:focus-visible`).
Everything else is Tailwind utilities plus the components in
`src/components/ui`.

**Do not reintroduce per-screen CSS classes.** That's how the app ended up
with two styling systems.

One trap worth knowing: a legacy class named the same as a Tailwind utility
silently wins, because these rules sit after `@tailwind utilities`. `.grid`
setting `grid-template-columns` is exactly this — it would override
`grid-cols-*` without any error. If you add a class to `globals.css`, check
it doesn't shadow a utility name.

## Components

shadcn components live in `src/components/ui` and are **hand-managed** — there
is no CLI step in CI. Adding one means the component file, the Radix
dependency in `package.json`, and a regenerated `package-lock.json`.

Conventions:

- `cn()` from `@/lib/utils` merges classes; call-site classes win.
- **Button** — default is the primary action; `outline` is secondary. Destructive
  actions use `variant="outline"` with `border-destructive/30 text-destructive`
  rather than the solid destructive fill.
- **Badge** — `secondary` for the blue portion pill, `warn` for half / inactive.
- **Table** — use the primitives. Do **not** add per-cell borders: rows carry
  the border, and a cell border too would double every line.
- **Selects stay native.** The mess and portion pickers are real `<select>`
  elements and the month field is `<input type="month">`. On a mobile-first app
  the OS picker beats a custom dropdown, and native selects avoid Radix
  Select's hidden-input form integration. This is deliberate — don't "upgrade" it.
- **Radix Checkbox renders a `button`, not an `input`.** When it must submit a
  value, pass `name`/`value` and rely on Radix's hidden BubbleInput (verified
  present). Always associate its label with `htmlFor`/`id` — nesting alone
  leaves it unassociated and trips `jsx-a11y`.

## Code layout

| Module | Contains |
|---|---|
| `src/lib/billing.ts` | `splitEqually`, `round`, `sumShares`, `personMonthlyTotals`, `messMonthlyTotals` |
| `src/lib/split.ts` | `planGroup`, `planTotal`, `planPerPerson`, `SplitMode` |
| `src/lib/data.ts` | month helpers and queries (`getMonthOrders`, `getMembers`, `getMesses`, `getMonthsSummary`) |
| `src/lib/format.ts` | `money`, `prettyDate`, `prettyMonth`, `todayISO` |
| `src/lib/aggregate.ts` | `perPerson`, `perMess`, `grandTotal` |
| `src/lib/auth.ts` | `getSessionUser`, `getProfile` (React `cache`) |

- Server Components by default. Mutations are server actions in
  `src/app/*/actions.ts`.
- Money is **integer paise** everywhere internal; format only at the edge with
  `money()`.
- `todayISO()` is IST-aware. Never use `new Date().toISOString()` for the
  business date — it can be a day out for this audience.

## Accessibility

- Visible focus ring everywhere: a global `:focus-visible` outline, with shadcn
  components opting out via `focus-visible:outline-none` and using a ring.
- Labels associated with `htmlFor`/`id`.
- Toggle chips carry `aria-pressed`; the active tab carries `aria-current="page"`.
- `src/components/AxeDev.tsx` runs an axe audit in development only and logs
  violations to the console. It compiles away in production.

## Workflow

- **Never commit to `main`.** Branch, open a PR, and let the human merge.
  Never force-push.
- Preview deployments run against the **staging** Supabase project; production
  against prod.
- Migrations must be applied to staging **and** production after merge.
- Keep PRs single-purpose — a build failure should point at one thing.

## Deliberately not built

- **Settlements** (tracking who has actually paid whom) — deferred at the
  owner's request. The Bills pages show dues, not payments.
- A rotation suggestion for who takes the half — explicitly rejected.
- Dark mode — the tokens are structured for it (`darkMode: ["class"]`) but
  there is no UI.

## Verification

`tsc --noEmit --noUnusedLocals` and `eslint` both run clean, and the Tailwind
CLI can compile the stylesheet standalone to confirm every utility used is
emitted. `next build` cannot run in the development sandbox, so the Vercel
preview is the first real build each change gets.
