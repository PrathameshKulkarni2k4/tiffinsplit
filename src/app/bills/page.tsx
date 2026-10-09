import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { getMonthOrders, getMembers, getMesses, nameMap, currentMonthLabel } from "@/lib/data";
import { perPerson, grandTotal } from "@/lib/aggregate";
import { money, prettyMonth } from "@/lib/format";
import { cn } from "@/lib/utils";
import MonthPicker from "@/components/MonthPicker";
import ShareBar from "@/components/ShareBar";
import Avatar from "@/components/Avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

type SearchParams = { month?: string };

export const metadata = { title: "Bills" };

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>Bills</h1>
          <p className="mb-5 text-muted-foreground">What each person owes</p>
        </div>
        <MonthPicker month={month} />
      </div>

      {orders.length > 0 && (
        <div className="mb-5">
          <ShareBar
            month={month}
            monthLabel={prettyMonth(month)}
            lines={members
              .filter((m) => totals[m.id])
              .map((m) => ({
                name: names[m.id] ?? "—",
                amount: money(totals[m.id] ?? 0),
              }))}
            total={money(total)}
          />
        </div>
      )}

      {/* A month with nothing in it used to render one empty card per member -
          six identical "No orders this month" panels stacked down the screen,
          which reads as a broken page. One honest empty state says more. */}
      {orders.length === 0 && (
        <EmptyState
          icon={ReceiptText}
          title={`Nothing logged for ${prettyMonth(month)}`}
          body="Once someone logs a tiffin, everyone's share of it shows up here."
          action={
            <Button asChild>
              <Link href="/today">Log a tiffin</Link>
            </Button>
          }
        />
      )}

      {orders.length > 0 && members.map((m) => {
        const entries = Object.entries(matrix[m.id] ?? {});
        return (
          <Card key={m.id} className="mb-[18px] px-5 py-[18px]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href={`/bills/${m.id}?month=${month}`}
                className="inline-flex items-center gap-2.5 py-0.5 font-bold hover:no-underline"
              >
                <Avatar name={names[m.id] ?? "?"} size="sm" />
                {names[m.id]}
              </Link>
              <span className="fig font-semibold">{money(totals[m.id] ?? 0)}</span>
            </div>
            {entries.length > 0 ? (
              <Table className="mt-1">
                <TableBody>
                  {entries.map(([messId, amt]) => (
                    <TableRow key={messId}>
                      <TableCell className="px-0 text-sm text-muted-foreground">
                        {messNames[messId] ?? "—"}
                      </TableCell>
                      <TableCell className="px-0 text-right font-semibold tabular-nums">
                        {money(amt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">No orders this month.</p>
            )}
          </Card>
        );
      })}

      <Card
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 px-5 py-[18px]",
          orders.length === 0 && "hidden",
        )}
      >
        <strong>Group total</strong>
        <span className="fig font-semibold">{money(total)}</span>
      </Card>
    </>
  );
}
