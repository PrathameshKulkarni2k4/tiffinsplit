# TiffinSplit

Split our mess tiffin bills — correctly.

Six colleagues order afternoon tiffins from different messes at different rates,
sometimes full and sometimes half, shared between one, two, or more people.
TiffinSplit logs each order and works out exactly who owes what, to the paise,
plus the total owed to each mess.

It runs entirely on **free tiers**: [Supabase](https://supabase.com) for the
database and Google sign-in, and [Vercel](https://vercel.com) for hosting.

---

## What's included (MVP)

- **Google sign-in** for the group members, behind an **approval gate** (see below).
- **Messes** — add them with a full and a half price; deactivate when you stop using one.
- **Log a tiffin** — date, mess, full/half, price (pre-filled from the mess, editable),
  and who shared it. Equal split, exact to the paise.
- **Dashboard** — this month's totals and your own dues.
- **Bills** — each person's dues with a per-mess breakdown.
- **Messes owed** — how much the group owes each mess this month.
- **Orders** — the full history for the month, with delete.
- **Members** (admin only) — approve new sign-ins, promote/demote, deactivate.
- **Billing engine with unit tests** covering every split case in the SRS.

Settlements, vendor-payment records, and PDF/Excel export are the next phase
(see the Project Plan document).

---

## The approval gate

Nobody gets in just by having the URL. The first time someone signs in with
Google, the database creates their profile as **inactive (pending)**. Until an
admin approves them, they see only a friendly "waiting for approval" screen and
can read **none** of the group's data — the lock is enforced in the database
itself, not just the screen.

The very first person to sign in is therefore also pending. You make them the
admin with a one-time SQL line (step 6 below); after that, approve everyone else
from the in-app **Members** page.

This means you can safely publish the Google app later, or let the link travel,
without a stranger ever seeing your bills.

---

## 1. Create a Supabase project (free)

1. Sign up at <https://supabase.com> and create a new project (the free plan is fine).
2. Wait for it to finish provisioning.

## 2. Create the database

1. In your Supabase project, open **SQL Editor**.
2. Paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and run it.
3. (Optional) Run [`supabase/seed.sql`](supabase/seed.sql) to add two starter messes.

> Already ran an earlier version of the schema? Run
> [`supabase/approval_gate.sql`](supabase/approval_gate.sql) instead — it adds the
> approval gate to an existing database.

## 3. Turn on Google sign-in

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) → create a project.
2. **APIs & Services → OAuth consent screen**: choose *External*, fill in the app name
   and your email, and (while in testing) add your six email addresses as *Test users*.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**
   - **Authorized redirect URI**:
     `https://YOUR-PROJECT-ref.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client secret**.
5. In Supabase: **Authentication → Providers → Google** → enable it and paste the
   Client ID and secret.
6. In Supabase: **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000` while developing.
   - **Redirect URLs**: add `http://localhost:3000/auth/callback` and, later, your
     Vercel URL `https://your-app.vercel.app/auth/callback`.

> Cost note: Google Sign-In itself is free and needs no billing account. Ignore the
> "$300 free trial" banner in the Google Cloud console — that is for paid Google Cloud
> products, not sign-in. The "10,000 grants/day" figure is a rate limit, not a charge.

## 4. Point the app at your project

1. Copy `.env.local.example` to `.env.local`.
2. Fill in the values from Supabase → **Project Settings → API**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```

## 5. Run it locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000> and sign in with Google. You'll land on the
"waiting for approval" screen — that's expected.

## 6. Make yourself the admin

In Supabase **SQL Editor**, with your email:

```sql
update public.users
   set role = 'admin', is_active = true
   where email = 'you@example.com';
```

Reload the app: you're now an active admin. Open **Members**, and as each of the
other five signs in, hit **Approve**. That's the whole flow.

---

## Testing

The billing engine is the part that must never be wrong, so it is unit-tested:

```bash
npm test        # runs tests/billing.test.ts (Vitest)
npm run typecheck
npm run build
```

---

## Deploy to Vercel (free)

1. Push this folder to a GitHub repository.
2. At <https://vercel.com>, **Add New → Project** and import the repo.
3. Add the two `NEXT_PUBLIC_SUPABASE_*` environment variables.
4. Deploy. Then add your Vercel URL to Supabase's **Redirect URLs** (step 3.6).

---

## How the money maths works

For an order priced `P` shared by `n` people, each pays `P / n`. Because we keep
paise, an uneven split is resolved without losing or inventing a paisa:

1. Work in integer paise: `paise = round(P * 100)`.
2. `base = floor(paise / n)`, `remainder = paise - base * n`.
3. Everyone gets `base` paise; the first `remainder` sharers (by user id) get one extra paisa.

So ₹65 shared by three is **₹21.67 + ₹21.67 + ₹21.66 = ₹65.00** exactly.

The invariant that makes the month balance: the sum of all members' dues always
equals the sum of all messes' totals. The test suite checks it.

---

## Project structure

```
src/
  app/                 Next.js App Router pages and server actions
    login/             Google sign-in
    auth/              OAuth callback and sign-out routes
    pending/           "waiting for approval" screen
    orders/            log, list, delete orders (OrderForm is the client form)
    bills/             per-person monthly bills
    vendors/           per-mess monthly totals
    messes/            manage messes and prices
    members/           admin: approve and manage members
  components/Nav.tsx   top navigation (role-aware)
  lib/
    billing.ts         the split engine (unit-tested, no dependencies)
    aggregate.ts       joins orders -> billing engine
    data.ts            database queries
    format.ts          currency and date formatting
    supabase/          browser, server, and middleware clients
  middleware.ts        session refresh + route guard + approval gate
supabase/
  schema.sql           tables, trigger, approval gate, row-level security
  approval_gate.sql    migration for databases created before the gate
  seed.sql             optional starter messes
tests/billing.test.ts  the split test suite
```
