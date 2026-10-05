import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getMonthOrders, getMembers, nameMap, currentMonthLabel } from "@/lib/data";
import { money, prettyDate } from "@/lib/format";
import MonthPicker from "@/components/MonthPicker";
import { deleteOrder } from "./actions";

type SearchParams = { month?: string };

export default async function OrdersPage({ searchParams }: { searchParams?: SearchParams }) {
  const month = typeof searchParams?.month === "string" ? searchParams.month : currentMonthLabel();

  const user = await getSessionUser();
  const [orders, members] = await Promise.all([getMonthOrders(month), getMembers()]);
  const names = nameMap(members);
  const me = members.find((m) => m.id === user?.id);
  const isAdmin = me?.role === "admin";

  const canDelete = (createdBy: string) => createdBy === user?.id || isAdmin;

  return (
    <>
      <div className="row">
        <div>
          <h1>Orders</h1>
          <p className="subtitle">Every tiffin logged this month</p>
        </div>
        <div className="page-actions">
          <MonthPicker month={month} />
          <Link href="/orders/new" className="btn primary">
            + Log a tiffin
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card">
          <p className="muted">
            No orders this month. <Link href="/orders/new">Log the first tiffin.</Link>
          </p>
        </div>
      ) : (
        <>
          {/* Desktop: table */}
          <div className="card table-wrap desktop-only-block">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Mess</th>
                  <th>Portion</th>
                  <th className="num">Price</th>
                  <th>Split between</th>
                  <th>Logged by</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{prettyDate(o.order_date)}</td>
                    <td>{o.messes?.name ?? "—"}</td>
                    <td>
                      <span className={`pill ${o.tiffin_type}`}>{o.tiffin_type}</span>
                    </td>
                    <td className="num amount">{money(o.unit_price)}</td>
                    <td>
                      {(o.order_shares ?? [])
                        .map((s) => `${names[s.user_id] ?? "—"} ${money(s.share_amount)}`)
                        .join(" · ")}
                    </td>
                    <td className="muted">{names[o.created_by] ?? "—"}</td>
                    <td className="num">
                      {canDelete(o.created_by) && (
                        <form action={deleteOrder}>
                          <input type="hidden" name="id" value={o.id} />
                          <button className="btn small danger" type="submit">
                            Delete
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <div className="mobile-only-block">
            {orders.map((o) => (
              <div className="card" key={o.id}>
                <div className="row">
                  <span className="muted">{prettyDate(o.order_date)}</span>
                  <span className={`pill ${o.tiffin_type}`}>{o.tiffin_type}</span>
                  <span className="amount">{money(o.unit_price)}</span>
                </div>
                <div style={{ fontWeight: 600, marginTop: 6 }}>{o.messes?.name ?? "—"}</div>
                <div className="muted" style={{ marginTop: 2 }}>
                  {(o.order_shares ?? [])
                    .map((s) => `${names[s.user_id] ?? "—"} ${money(s.share_amount)}`)
                    .join(" · ")}
                </div>
                <div className="row" style={{ marginTop: 10 }}>
                  <span className="muted">Logged by {names[o.created_by] ?? "—"}</span>
                  {canDelete(o.created_by) && (
                    <form action={deleteOrder}>
                      <input type="hidden" name="id" value={o.id} />
                      <button className="btn small danger" type="submit">
                        Delete
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
