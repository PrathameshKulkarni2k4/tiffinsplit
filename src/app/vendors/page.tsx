import { getMonthOrders, getMesses, currentMonthLabel } from "@/lib/data";
import { perMess, grandTotal } from "@/lib/aggregate";
import { money, prettyMonth } from "@/lib/format";

type SearchParams = { month?: string };

export default async function VendorsPage({ searchParams }: { searchParams?: SearchParams }) {
  const month = typeof searchParams?.month === "string" ? searchParams.month : currentMonthLabel();
  const [orders, messes] = await Promise.all([getMonthOrders(month), getMesses(false)]);

  const totals = perMess(orders);
  const counts: Record<string, number> = {};
  for (const o of orders) counts[o.mess_id] = (counts[o.mess_id] ?? 0) + 1;

  const rows = messes
    .map((m) => ({ id: m.id, name: m.name, orders: counts[m.id] ?? 0, total: totals[m.id] ?? 0 }))
    .filter((r) => r.orders > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <>
      <h1>Messes owed</h1>
      <p className="subtitle">{prettyMonth(month)} — what the group owes each mess</p>

      {rows.length === 0 ? (
        <div className="card">
          <p className="muted">No orders this month yet.</p>
        </div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mess</th>
                <th className="num">Orders</th>
                <th className="num">Amount owed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td className="num">{r.orders}</td>
                  <td className="num amount">{money(r.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th>Total</th>
                <th className="num">{orders.length}</th>
                <th className="num amount">{money(grandTotal(orders))}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </>
  );
}
