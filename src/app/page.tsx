import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import {
  getMonthOrders,
  getMembers,
  getMonthsSummary,
  nameMap,
  currentMonthLabel,
} from "@/lib/data";
import { perPerson, grandTotal } from "@/lib/aggregate";
import { money, prettyMonth, prettyDate } from "@/lib/format";
import MonthPicker from "@/components/MonthPicker";

type SearchParams = { month?: string };

export default async function DashboardPage({ searchParams }: { searchParams?: SearchParams }) {
  const user = await getSessionUser();
  const month = typeof searchParams?.month === "string" ? searchParams.month : currentMonthLabel();

  const [orders, members, summary] = await Promise.all([
    getMonthOrders(month),
    getMembers(),
    getMonthsSummary(6),
  ]);
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
        <div className="page-actions">
          <MonthPicker month={month} />
          <Link href="/orders/new" className="btn primary">
            + Log a tiffin
          </Link>
        </div>
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

      <h2>Month by month</h2>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th className="num">Orders</th>
              <th className="num">Group total</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((s) => (
              <tr key={s.month}>
                <td>
                  <Link href={`/?month=${s.month}`}>{prettyMonth(s.month)}</Link>
                </td>
                <td className="num">{s.orders}</td>
                <td className="num amount">{money(s.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Recent orders</h2>
      {recent.length === 0 ? (
        <div className="card">
          <p className="muted">
            No orders in this month. <Link href="/orders/new">Log a tiffin.</Link>
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
