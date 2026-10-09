import Link from "next/link";
import { notFound } from "next/navigation";
import { getMonthOrders, getMembers, nameMap, currentMonthLabel } from "@/lib/data";
import { money, prettyDate, prettyMonth } from "@/lib/format";
import MonthPicker from "@/components/MonthPicker";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SearchParams = { month?: string };

export const metadata = { title: "Bill" };

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

  const portionVariant = (t: string) => (t === "half" ? "warn" : "secondary");

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>{names[person.id]}</h1>
          <p className="mb-5 text-muted-foreground">
            {prettyMonth(month)} · what they owe, order by order
          </p>
        </div>
        <MonthPicker month={month} />
      </div>

      <Card className="mb-[18px] flex flex-wrap items-center justify-between gap-3 px-5 py-[18px]">
        <strong>Total this month</strong>
        <span className="fig font-semibold">{money(total)}</span>
      </Card>

      {rows.length === 0 ? (
        <Card className="px-5 py-[18px]">
          <p className="m-0 text-sm text-muted-foreground">
            No orders for {names[person.id]} this month.
          </p>
        </Card>
      ) : (
        <>
          {/* Desktop: table */}
          <Card className="hidden overflow-hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Mess</TableHead>
                  <TableHead>Portion</TableHead>
                  <TableHead className="text-right">Tiffin</TableHead>
                  <TableHead>Shared with</TableHead>
                  <TableHead className="text-right">Their share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ order, amount }) => {
                  const others = (order.order_shares ?? []).filter(
                    (s) => s.user_id !== params.userId
                  );
                  return (
                    <TableRow key={order.id}>
                      <TableCell>{prettyDate(order.order_date)}</TableCell>
                      <TableCell>{order.messes?.name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={portionVariant(order.tiffin_type)}>
                          {order.tiffin_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {money(order.unit_price)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {others.length
                          ? others.map((s) => names[s.user_id] ?? "—").join(", ")
                          : "alone"}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {money(amount)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile: cards — six columns can't fit a phone */}
          <div className="md:hidden">
            {rows.map(({ order, amount }) => {
              const others = (order.order_shares ?? []).filter((s) => s.user_id !== params.userId);
              return (
                <Card key={order.id} className="mb-[18px] px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">
                      {prettyDate(order.order_date)}
                    </span>
                    <Badge variant={portionVariant(order.tiffin_type)}>
                      {order.tiffin_type}
                    </Badge>
                    <span className="fig font-semibold">{money(amount)}</span>
                  </div>
                  <div className="mt-1.5 font-semibold">{order.messes?.name ?? "—"}</div>
                  <div className="mt-0.5 text-sm text-muted-foreground">
                    Tiffin {money(order.unit_price)} ·{" "}
                    {others.length
                      ? `with ${others.map((s) => names[s.user_id] ?? "—").join(", ")}`
                      : "eaten alone"}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      <p className="text-sm text-muted-foreground">
        <Link href={`/bills?month=${month}`} className="inline-block py-1">
          ← Back to Bills
        </Link>
      </p>
    </>
  );
}
