import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMonthOrders, getMembers, nameMap, currentMonthLabel } from "@/lib/data";
import { perPerson, grandTotal } from "@/lib/aggregate";
import { money, prettyMonth, prettyDate } from "@/lib/format";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const month = currentMonthLabel();
  const [orders, members] = await Promise.all([getMonthOrders(month), getMembers()]);
  const names = nameMap(members);

  const dues = perPerson(orders);
  const total = grandTotal(orders);
  const mine = user ? dues[user.id] ?? 0 : 0;
  const recent = orders.slice(0, 6);

  return (
    <>
      <div className="row">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">{prettyMonth(month)}</p>
        </div>
        <Link href="/orders/new" className="btn primary">
          + Log a tiffin
        </Link>
      </div>

      <div className="grid">
        <div className="stat">
          <div className="label">My dues this month</div>
          <div className="value">{money(mine)}</div>
        </div>
        <div className="stat">
          <div className="label">Group total</div>
          <div className="value">{money(total)}</div>
        </div>
        <div className="stat">
          <div className="label">Orders logged</div>
          <div className="value">{orders.length}</div>
        </div>
      </div>

      <h2>Everyone this month</h2>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th className="num">Dues</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td>
                  {names[m.id]}
                  {m.id === user?.id ? " (you)" : ""}
                </td>
                <td className="num amount">{money(dues[m.id] ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Recent orders</h2>
      {recent.length === 0 ? (
        <div className="card">
          <p className="muted">
            No orders yet this month. <Link href="/orders/new">Log the first tiffin.</Link>
          </p>
        </div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Mess</th>
                <th>Portion</th>
                <th className="num">Price</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id}>
                  <td>{prettyDate(o.order_date)}</td>
                  <td>{o.messes?.name ?? "—"}</td>
                  <td>
                    <span className={`pill ${o.tiffin_type}`}>{o.tiffin_type}</span>
                  </td>
                  <td className="num amount">{money(o.unit_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
