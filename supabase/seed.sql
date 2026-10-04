-- Optional starter data. Safe to run once; it only inserts if the table is empty.
insert into public.messes (name, full_price, half_price)
select * from (values
  ('Shree Mess',       90.00, 65.00),
  ('Annapurna Tiffin', 100.00, 70.00)
) as v(name, full_price, half_price)
where not exists (select 1 from public.messes);
