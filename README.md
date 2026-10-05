# TiffinSplit

Split our mess tiffin bills - correctly.

Six colleagues order afternoon tiffins from different messes at different rates,
sometimes full and sometimes half, shared between one, two, or more people.
TiffinSplit logs each order and works out exactly who owes what, to the paise,
plus the total owed to each mess.

It runs entirely on **free tiers**: Supabase for the database and Google sign-in,
and Vercel for hosting.

---

## What's included (MVP)

- **Google sign-in** for the group members, behind an **approval gate** (see below).
- **Messes** - add them with a full and a half price; deactivate when you stop using one.
- **Log a tiffin** - date, mess, full/half, price (pre-filled from the mess, editable),
  and who shared it. Equal split, exact to the paise.
- **Dashboard** - this month's totals and your own dues.
- **Bills** - each person's dues with a per-mess breakdown.
- **Messes owed** - how much the group owes each mess this month.
- **Orders** - the full history for the month, with delete.
- **Members** (admin only) - approve new sign-ins, promote/demote, deactivate.
- **Billing engine with unit tests** covering every split case in the SRS.

Settlements, vendor-payment records, and PDF/Excel export are the next phase.

---

## The approval gate

Nobody gets in just by having the URL. The first time someone signs in with
Google, the database creates their profile as **inactive (pending)**. Until an
admin approves them, they see only a "waiting for approval" screen and can read
**none** of the group's data - enforced in the database, not just the screen.

The very first person to sign in is therefore also pending. Make them the admin
with a one-time SQL line (step 6 below); after that, approve everyone else from
the in-app **Members** page.

---

## Environments

| Environment | App | Database | Deploys when |
| --- | --- | --- | --- |
| Local | `next dev` | (optional) local | - |
| Preview / staging | Vercel preview URL | `tiffinsplit-staging` | a branch is pushed |
| Production | `tiffinsplit.vercel.app` | `tiffinsplit` (prod) | `main` is merged |

Every pull request gets its own Vercel **preview deployment** - that is your
staging environment for code. Point it at the staging database
(Vercel -> Settings -> Environment Variables -> *Preview*) so changes are
exercised against a separate copy before they reach production.

---

## Database changes (migrations)

`supabase/migrations/` is the source of truth for the schema.

- Migrations are numbered and applied **in order**: staging first, then production.
- Write migrations **additively** where you can - add a column or table now, and
  remove the old thing later in its own migration (the *expand/contract* pattern).
  That way, if a feature is rejected, you roll back the code and the database is
  left untouched and harmless.
- The free Supabase plan has **no automatic backups or point-in-time recovery**,
  so treat destructive migrations (`drop`, data rewrites) with care, and never
  bundle one into the same change as the feature that needs it.

Apply migrations with the Supabase CLI (`supabase db push`) or by pasting the
file into the Supabase **SQL Editor**. `supabase/schema.sql` mirrors the initial
migration for a quick one-time paste.

---

## 1. Create a Supabase project (free)

1. Sign up at https://supabase.com and create a new project (the free plan is fine).
2. Wait for it to finish provisioning.

## 2. Create the database

1. Apply `supabase/migrations/*.sql` in order - via the SQL Editor or `supabase db push`.
2. (Optional) Run `supabase/seed.sql` to add two starter messes.

## 3. Turn on Google sign-in

1. Go to the Google Cloud Console and create a project.
2. **APIs & Services -> OAuth consent screen**: choose *External*, fill in the app
   name and your email, and (while in testing) add your six emails as *Test users*.
3. **APIs & Services -> Credentials -> Create credentials -> OAuth client ID**:
   - Application type: **Web application**
   - **Authorized redirect URIs** (one per environment):
     - `https://YOUR-PROJECT-ref.supabase.co/auth/v1/callback`
     - `https://YOUR-STAGING-ref.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client secret**.
5. In Supabase: **Authentication -> Providers -> Google** -> enable it and paste the
   Client ID and secret. (Repeat in the staging project if you want to sign in there.)
6. In Supabase: **Authentication -> URL Configuration** - set the **Site URL** and add
   the redirect URLs for local, preview, and production.

> Cost note: Google Sign-In is free and needs no billing account. Ignore the
> "$300 free trial" banner in the Google Cloud console - that is for paid Google
> Cloud products. The "10,000 grants/day" figure is a rate limit, not a charge.

## 4. Point the app at your project

1. Copy `.env.local.example` to `.env.local`.
2. Fill in the values from Supabase -> **Project Settings -> API**:

   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key

## 5. Run it locally

    npm install
    npm run dev

Open http://localhost:3000 and sign in with Google. You'll land on the
"waiting for approval" screen - that's expected.

## 6. Make yourself the admin

In the Supabase **SQL Editor**, with your email:

    update public.users set role = 'admin', is_active = true where email = 'you@example.com';

Reload the app: you're now an active admin. Open **Members**, and as each of the
other five signs in, hit **Approve**.

---

## Testing

    npm test        # billing engine unit tests (Vitest)
    npm run typecheck
    npm run build

---

## Deploy to Vercel (free)

1. Push this folder to a GitHub repository.
2. At https://vercel.com, **Add New -> Project** and import the repo.
3. Add the two `NEXT_PUBLIC_SUPABASE_*` environment variables - production values
   for *Production*, staging values for *Preview*.
4. Deploy. Then add your Vercel URLs to Supabase's redirect URLs.

---

## How the money maths works

For an order priced `P` shared by `n` people, each pays `P / n`. Because we keep
paise, an uneven split is resolved without losing or inventing a paisa:

1. Work in integer paise: `paise = round(P * 100)`.
2. `base = floor(paise / n)`, `remainder = paise - base * n`.
3. Everyone gets `base` paise; the first `remainder` sharers (by user id) get one extra paisa.

So Rs 65 shared by three is **21.67 + 21.67 + 21.66 = 65.00** exactly.

The invariant that makes the month balance: the sum of all members' dues always
equals the sum of all messes' totals. The test suite checks it.

---

## Project structure

    src/                 Next.js App Router pages and server actions
      app/               login, pending, orders, bills, vendors, messes, members
      components/Nav.tsx role-aware navigation
      lib/               billing engine, data queries, formatting, supabase clients
      middleware.ts      session refresh + route guard + approval gate
    supabase/
      migrations/        schema history (source of truth)
      schema.sql         quick one-time paste (mirrors the init migration)
      seed.sql           optional starter messes
    tests/               billing test suite
