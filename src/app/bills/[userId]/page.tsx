import Link from "next/link";
import { notFound } from "next/navigation";
import { getMonthOrders, getMembers, nameMap, currentMonthLabel } from "@/lib/data";
import { money, prettyDate, prettyMonth } from "@/lib/format";
import MonthPicker from "@/components/MonthPicker";

type SearchParams = { month?: string };

export default async function PersonBillPage({
  params,
  searchParams,
}: {
  params: { userId: string };
  searchParams?: SearchParams;
}) {
  const month = typeof searchParams?.month === "string" ? searchParams.month : currentMonthLabel();
  const [orders, members] = await Promise.all([getMonthOrders(month), getMembers()]);
  const names = nameMap(members);
  const person = members.find((m) => m.id === params.userId);
  if (!person) notFound();

  const rows = orders
    .map((o) => {
      const share = (o.order_shares ?? []).find((s) => s.user_id === params.userId);
      return share ? { order: o, amount: Number(share.share_amount) } : null;
    })
    .filter((r): r is { order: (typeof orders)[number]; amount: number } => r !== null);

  const total = Math.round(rows.reduce((s, r) => s + r.amount, 0) * 100) / 100;

  return (
    <>
      <div className="row">
        <div>
          <h1>{names[person.id]}</h1>
          <p className="subtitle">{prettyMonth(month)} · what they owe, order by order</p>
        </div>
        <MonthPicker month={month} />
      </div>

      <div className="card row">
        <strong>Total this month</strong>
        <span className="amount">{money(total)}</span>
      </div>

      {rows.length === 0 ? (
        <div className="card">
          <p className="muted">No orders for {names[person.id]} this month.</p>
        </div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Mess</th>
                <th>Portion</th>
                <th className="num">Tiffin</th>
                <th>Shared with</th>
                <th className="num">Their share</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ order, amount }) => {
                const others = (order.order_shares ?? []).filter((s) => s.user_id !== params.userId);
                return (
                  <tr key={order.id}>
                    <td>{prettyDate(order.order_date)}</td>
                    <td>{order.messes?.name ?? "—"}</td>
                    <td>
                      <span className={`pill ${order.tiffin_type}`}>{order.tiffin_type}</span>
                    </td>
                    <td className="num amount">{money(order.unit_price)}</td>
                    <td className="muted">
                      {others.length ? others.map((s) => names[s.user_id] ?? "—").join(", ") : "alone"}
                    </td>
                    <td className="num amount">{money(amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="muted">
        <Link href={`/bills?month=${month}`}>← Back to Bills</Link>
      </p>
    </>
  );
}
