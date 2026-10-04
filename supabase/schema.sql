-- =====================================================================
--  TiffinSplit - database schema
--  Run this once in the Supabase SQL editor (Project -> SQL Editor).
--  It creates the tables, the profile trigger, the approval gate, and
--  Row-Level Security.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
--  Tables
-- ---------------------------------------------------------------------

-- Member profiles. One row per auth user; id mirrors auth.users.id.
-- New sign-ins start INACTIVE (is_active = false) and must be approved
-- by an admin before they can see any group data. This is the approval gate.
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  role        text not null default 'member' check (role in ('member','admin')),
  is_active   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Messes (vendors) and their default prices.
create table if not exists public.messes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  full_price  numeric(10,2) not null default 90.00 check (full_price >= 0),
  half_price  numeric(10,2) not null default 65.00 check (half_price >= 0),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- A logged tiffin order. unit_price is a snapshot (default from the mess,
-- but editable per order), so history stays correct if prices change.
create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  order_date   date not null default current_date,
  mess_id      uuid not null references public.messes(id),
  tiffin_type  text not null check (tiffin_type in ('full','half')),
  unit_price   numeric(10,2) not null check (unit_price >= 0),
  created_by   uuid not null references public.users(id),
  notes        text,
  created_at   timestamptz not null default now()
);

-- One row per sharer of an order, with the computed equal share.
create table if not exists public.order_shares (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  user_id       uuid not null references public.users(id),
  share_amount  numeric(10,2) not null check (share_amount >= 0),
  unique (order_id, user_id)
);

-- Member-to-member settlements (clearing dues).
create table if not exists public.settlements (
  id          uuid primary key default gen_random_uuid(),
  from_user   uuid not null references public.users(id),
  to_user     uuid not null references public.users(id),
  amount      numeric(10,2) not null check (amount > 0),
  settled_on  date not null default current_date,
  note        text,
  created_at  timestamptz not null default now()
);

-- Payments made to a mess vendor for a given month.
create table if not exists public.vendor_payments (
  id            uuid primary key default gen_random_uuid(),
  mess_id       uuid not null references public.messes(id),
  paid_by       uuid not null references public.users(id),
  amount        numeric(10,2) not null check (amount > 0),
  period_month  date not null,
  paid_on       date not null default current_date,
  created_at    timestamptz not null default now()
);

create index if not exists orders_order_date_idx on public.orders (order_date);
create index if not exists order_shares_order_id_idx on public.order_shares (order_id);
create index if not exists order_shares_user_id_idx on public.order_shares (user_id);

-- ---------------------------------------------------------------------
--  Auto-create a (pending) profile row when someone signs in first time.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
--  Row-Level Security helpers
-- ---------------------------------------------------------------------
-- A member is an *active* user. Pending (inactive) users are not members,
-- so they can read none of the group's data.
create or replace function public.is_member()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.users u where u.id = auth.uid() and u.is_active
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'admin' and u.is_active
  );
$$;

-- ---------------------------------------------------------------------
--  Enable RLS
-- ---------------------------------------------------------------------
alter table public.users            enable row level security;
alter table public.messes           enable row level security;
alter table public.orders           enable row level security;
alter table public.order_shares     enable row level security;
alter table public.settlements      enable row level security;
alter table public.vendor_payments  enable row level security;

-- users
--  * "self read" lets a pending user see their own row (to show "awaiting approval").
--  * "members read users" lets active members see the group.
--  * admins can read and manage everyone.
create policy "self read"            on public.users for select using (auth.uid() = id);
create policy "members read users"   on public.users for select using (public.is_member());
create policy "self update"          on public.users for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "admin manage users"   on public.users for all    using (public.is_admin()) with check (public.is_admin());

-- messes
create policy "members read messes"  on public.messes for select using (public.is_member());
create policy "members add messes"   on public.messes for insert with check (public.is_member());
create policy "members edit messes"  on public.messes for update using (public.is_member()) with check (public.is_member());

-- orders
create policy "members read orders"  on public.orders for select using (public.is_member());
create policy "members add orders"   on public.orders for insert with check (public.is_member() and created_by = auth.uid());
create policy "owner edits orders"   on public.orders for update using (created_by = auth.uid() or public.is_admin()) with check (created_by = auth.uid() or public.is_admin());
create policy "owner deletes orders" on public.orders for delete using (created_by = auth.uid() or public.is_admin());

-- order_shares (only the order's owner or an admin may write shares)
create policy "members read shares"  on public.order_shares for select using (public.is_member());
create policy "members add shares"   on public.order_shares for insert with check (
  public.is_member() and exists (
    select 1 from public.orders o
    where o.id = order_id and (o.created_by = auth.uid() or public.is_admin())
  )
);
create policy "members edit shares"  on public.order_shares for update using (
  public.is_member() and exists (
    select 1 from public.orders o
    where o.id = order_id and (o.created_by = auth.uid() or public.is_admin())
  )
) with check (
  public.is_member() and exists (
    select 1 from public.orders o
    where o.id = order_id and (o.created_by = auth.uid() or public.is_admin())
  )
);
create policy "members delete shares" on public.order_shares for delete using (
  public.is_member() and exists (
    select 1 from public.orders o
    where o.id = order_id and (o.created_by = auth.uid() or public.is_admin())
  )
);

-- settlements
create policy "members read settlements"  on public.settlements for select using (public.is_member());
create policy "members add settlements"   on public.settlements for insert with check (public.is_member());
create policy "members delete settlements" on public.settlements for delete using (public.is_member());

-- vendor_payments
create policy "members read vp"   on public.vendor_payments for select using (public.is_member());
create policy "members add vp"    on public.vendor_payments for insert with check (public.is_member());
create policy "members delete vp" on public.vendor_payments for delete using (public.is_member());

-- =====================================================================
--  ONE-TIME ADMIN BOOTSTRAP
--  The very first person to sign in lands as a PENDING member. Make them
--  the active admin by running this once (with your email):
--
--    update public.users
--       set role = 'admin', is_active = true
--     where email = 'you@example.com';
--
--  After that, approve everyone else from the in-app Members page.
-- =====================================================================
