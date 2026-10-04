import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMonthOrders, getMembers, nameMap, currentMonthLabel } from "@/lib/data";
import { money, prettyDate, prettyMonth } from "@/lib/format";
import { deleteOrder } from "./actions";

type SearchParams = { month?: string };

export default async function OrdersPage({ searchParams }: { searchParams?: SearchParams }) {
  const month = typeof searchParams?.month === "string" ? searchParams.month : currentMonthLabel();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [orders, members] = await Promise.all([getMonthOrders(month), getMembers()]);
  const names = nameMap(members);
  const me = members.find((m) => m.id === user?.id);
  const isAdmin = me?.role === "admin";

  return (
    <>
      <div className="row">
        <div>
          <h1>Orders</h1>
          <p className="subtitle">{prettyMonth(month)}</p>
        </div>
        <Link href="/orders/new" className="btn primary">
          + Log a tiffin
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="card">
          <p className="muted">
            No orders this month. <Link href="/orders/new">Log the first tiffin.</Link>
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
                <th>Split between</th>
                <th>Logged by</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const canDelete = o.created_by === user?.id || isAdmin;
                return (
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
                      {canDelete && (
                        <form action={deleteOrder}>
                          <input type="hidden" name="id" value={o.id} />
                          <button className="btn small danger" type="submit">
                            Delete
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
