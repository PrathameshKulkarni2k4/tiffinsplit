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
import { Button } from "@/components/ui/button";
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="px-[18px] py-4">
      <div className="text-[0.72rem] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
        {label}
      </div>
      {/* The number is the point of the card, so it gets the display treatment:
          mono, tight tracking, and enough size to read at arm's length. */}
      <div className="fig mt-2 text-[1.75rem] font-semibold leading-none tracking-tight">
        {value}
      </div>
    </Card>
  );
}

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>Dashboard</h1>
          <p className="mb-5 text-muted-foreground">{prettyMonth(month)}</p>
        </div>
        <div className="flex w-full flex-col items-stretch gap-2.5 sm:w-auto sm:flex-row sm:items-center">
          <MonthPicker month={month} />
          <Button asChild>
            <Link href="/today">Log today&apos;s lunch</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
        <Stat label="My dues this month" value={money(mine)} />
        <Stat label="Group total" value={money(total)} />
        <Stat label="Orders logged" value={String(orders.length)} />
      </div>

      <div className="lg:mt-7 lg:grid lg:grid-cols-2 lg:gap-x-5">
        <section>
          <h2 className="lg:mt-0">Everyone this month</h2>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead className="text-right">Dues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      {names[m.id]}
                      {m.id === user?.id ? " (you)" : ""}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {money(dues[m.id] ?? 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>

        <section>
          <h2>Month by month</h2>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Group total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.map((s) => (
                  <TableRow key={s.month}>
                    <TableCell>
                      <Link href={`/?month=${s.month}`} className="inline-block py-1">
                        {prettyMonth(s.month)}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{s.orders}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {money(s.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>
      </div>

      <h2>Recent orders</h2>
      {recent.length === 0 ? (
        <Card className="px-5 py-[18px]">
          <p className="m-0 text-sm text-muted-foreground">
            No orders in this month. <Link href="/orders/new" className="underline">Log a tiffin.</Link>
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Mess</TableHead>
                <TableHead>Portion</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>{prettyDate(o.order_date)}</TableCell>
                  <TableCell>{o.messes?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={o.tiffin_type === "half" ? "warn" : "secondary"}>
                      {o.tiffin_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {money(o.unit_price)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
