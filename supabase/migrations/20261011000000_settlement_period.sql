-- Settlements can be attributed to the month they settle.
--
-- Without this, a payment made on the 3rd of November for October's dues would
-- land in November, and October would keep showing as unpaid forever. The
-- month a settlement belongs to is a fact about the settlement, not something
-- to infer from the date it happened to be made on.
--
-- Added in three steps rather than one: a NOT NULL column with no default
-- cannot be added to a table that already has rows, and this table is empty
-- now but will not always be.

alter table public.settlements
  add column if not exists period_month date;

update public.settlements
  set period_month = date_trunc('month', settled_on)::date
  where period_month is null;

alter table public.settlements
  alter column period_month set not null;

alter table public.settlements
  alter column period_month set default date_trunc('month', current_date)::date;

create index if not exists settlements_period_idx
  on public.settlements (period_month);
