import { getMonthOrders, getMembers, nameMap, currentMonthLabel } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { perPerson, grandTotal } from "@/lib/aggregate";

/**
 * CSV of a month's orders and their splits.
 *
 * A route handler rather than a client-side download, so the same RLS rules
 * that govern the screens govern the file. It reads through the user's own
 * session; there is no service key here and no way to ask for another group's
 * data.
 *
 * One row per share, not per order. An order is a tiffin; a share is what one
 * person owes for it. The group reconciles person by person, so that is the
 * grain that is actually useful in a spreadsheet.
 */
function csvCell(value: string | number): string {
  const s = String(value);
  // Quote anything containing a comma, quote or newline, and double up any
  // quotes inside - the standard escape.
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return new Response("Not signed in", { status: 401 });

  const url = new URL(request.url);
  const month = url.searchParams.get("month") || currentMonthLabel();

  const [orders, members] = await Promise.all([getMonthOrders(month), getMembers()]);
  const names = nameMap(members);

  const rows: string[] = [
    ["date", "mess", "portion", "order_total", "person", "share"].join(","),
  ];

  for (const o of orders) {
    for (const s of o.order_shares ?? []) {
      rows.push(
        [
          o.order_date,
          csvCell(o.messes?.name ?? ""),
          o.tiffin_type,
          Number(o.unit_price).toFixed(2),
          csvCell(names[s.user_id] ?? s.user_id),
          Number(s.share_amount).toFixed(2),
        ].join(","),
      );
    }
  }

  // A totals block, so the file reconciles without a formula.
  rows.push("");
  rows.push(["person", "total"].join(","));
  const totals = perPerson(orders);
  for (const m of members) {
    if (totals[m.id]) rows.push([csvCell(names[m.id] ?? m.id), totals[m.id].toFixed(2)].join(","));
  }
  rows.push(["GROUP TOTAL", grandTotal(orders).toFixed(2)].join(","));

  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tiffinsplit-${month}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
