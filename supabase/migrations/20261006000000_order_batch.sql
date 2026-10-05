-- 20261006000000_order_batch.sql
-- Groups orders that were logged together (e.g. one "Confirm today's lunch"),
-- so a whole batch can be undone in one step.
-- Additive and idempotent: safe to run on an existing database.

alter table public.orders add column if not exists batch_id uuid;

create index if not exists orders_batch_id_idx on public.orders (batch_id);
