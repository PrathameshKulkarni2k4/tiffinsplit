import { getMonthOrders, getMesses, currentMonthLabel } from "@/lib/data";
import { perMess, grandTotal } from "@/lib/aggregate";
import { money } from "@/lib/format";
import MonthPicker from "@/components/MonthPicker";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>Messes owed</h1>
          <p className="mb-5 text-muted-foreground">
            What the group owes each mess this month
          </p>
        </div>
        <MonthPicker month={month} />
      </div>

      {rows.length === 0 ? (
        <Card className="px-5 py-[18px]">
          <p className="m-0 text-sm text-muted-foreground">No orders this month yet.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mess</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Amount owed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.orders}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {money(r.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">{orders.length}</TableHead>
                <TableHead className="text-right font-semibold tabular-nums">
                  {money(grandTotal(orders))}
                </TableHead>
              </TableRow>
            </TableFooter>
          </Table>
        </Card>
      )}
    </>
  );
}
