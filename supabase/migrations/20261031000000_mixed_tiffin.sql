-- Mixed orders: a basket of fulls and halves.
--
-- The money was always representable - an order is a total price plus a list of
-- equal shares - but the composition was not. So a "1 full + 1 half" order had
-- to be logged as "full" at an inflated price, which was a lie about what was
-- bought: it showed up in the orders list, on the bills screen and in the CSV
-- export as a full tiffin.
--
-- Two nullable counts record what was actually ordered. They are null for
-- ordinary full/half orders, which keep working exactly as before.
--
-- The constraint name is not guessed: it was read back from the database
-- (`orders_tiffin_type_check`), because dropping a constraint by a name that
-- does not exist is silent - the old check would survive and reject 'mixed'.

alter table public.orders
  drop constraint if exists orders_tiffin_type_check;

alter table public.orders
  add constraint orders_tiffin_type_check
  check (tiffin_type in ('full', 'half', 'mixed'));

alter table public.orders
  add column if not exists full_qty int;

alter table public.orders
  add column if not exists half_qty int;

-- A mixed order must say what was in it, or the count is pointless.
alter table public.orders
  drop constraint if exists orders_mixed_qty_check;

alter table public.orders
  add constraint orders_mixed_qty_check
  check (
    tiffin_type <> 'mixed'
    or coalesce(full_qty, 0) + coalesce(half_qty, 0) > 0
  );
