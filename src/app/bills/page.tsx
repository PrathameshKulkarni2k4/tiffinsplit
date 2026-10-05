import Link from "next/link";
import { getMonthOrders, getMembers, getMesses, nameMap, currentMonthLabel } from "@/lib/data";
import { perPerson, grandTotal } from "@/lib/aggregate";
import { money } from "@/lib/format";
import MonthPicker from "@/components/MonthPicker";

type SearchParams = { month?: string };

export default async function BillsPage({ searchParams }: { searchParams?: SearchParams }) {
  const month = typeof searchParams?.month === "string" ? searchParams.month : currentMonthLabel();
  const [orders, members, messes] = await Promise.all([
    getMonthOrders(month),
    getMembers(),
    getMesses(false),
  ]);

  const names = nameMap(members);
  const messNames: Record<string, string> = {};
  for (const m of messes) messNames[m.id] = m.name;

  const totals = perPerson(orders);
  const total = grandTotal(orders);

  // Per-person, per-mess breakdown.
  const matrix: Record<string, Record<string, number>> = {};
  for (const o of orders) {
    for (const s of o.order_shares ?? []) {
      matrix[s.user_id] ??= {};
      matrix[s.user_id][o.mess_id] =
        Math.round(((matrix[s.user_id][o.mess_id] ?? 0) + Number(s.share_amount)) * 100) / 100;
    }
  }

  return (
    <>
      <div className="row">
        <div>
          <h1>Bills</h1>
          <p className="subtitle">What each person owes</p>
        </div>
        <MonthPicker month={month} />
      </div>

      {members.map((m) => {
        const entries = Object.entries(matrix[m.id] ?? {});
        return (
          <div className="card" key={m.id}>
            <div className="row">
              <Link href={`/bills/${m.id}?month=${month}`}>
                <strong>{names[m.id]}</strong>
              </Link>
              <span className="amount">{money(totals[m.id] ?? 0)}</span>
            </div>
            {entries.length > 0 ? (
              <table>
                <tbody>
                  {entries.map(([messId, amt]) => (
                    <tr key={messId}>
                      <td className="muted">{messNames[messId] ?? "—"}</td>
                      <td className="num amount">{money(amt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="muted">No orders this month.</p>
            )}
          </div>
        );
      })}

      <div className="card row">
        <strong>Group total</strong>
        <span className="amount">{money(total)}</span>
      </div>
    </>
  );
}
