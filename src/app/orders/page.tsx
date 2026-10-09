import Link from "next/link";
import { ReceiptText, Search, SearchX } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getMonthOrders, getMembers, nameMap, currentMonthLabel } from "@/lib/data";
import { money, prettyDate, prettyMonth } from "@/lib/format";
import MonthPicker from "@/components/MonthPicker";
import ConfirmButton from "@/components/ConfirmButton";
import { deleteOrder } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Names this page in the browser tab. The layout's template appends the app
// name, so the tab reads "Orders · TiffinSplit".
export const metadata = { title: "Orders" };

type SearchParams = { month?: string; q?: string };

const DELETE_CLASS =
  "border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive";

function Portion({ type }: { type: string }) {
  return <Badge variant={type === "half" ? "warn" : "secondary"}>{type}</Badge>;
}

export default async function OrdersPage({ searchParams }: { searchParams?: SearchParams }) {
  const month = typeof searchParams?.month === "string" ? searchParams.month : currentMonthLabel();

  const user = await getSessionUser();
  const [orders, members] = await Promise.all([getMonthOrders(month), getMembers()]);
  const names = nameMap(members);
  const me = members.find((m) => m.id === user?.id);
  const isAdmin = me?.role === "admin";

  const canDelete = (createdBy: string) => createdBy === user?.id || isAdmin;

  const q = typeof searchParams?.q === "string" ? searchParams.q.trim() : "";

  // Filtered in memory. The month is already loaded and a group logs tens of
  // orders a month, not thousands - a query would be more machinery for less
  // speed. Matches a mess, a portion, or anyone who shares in the order.
  const needle = q.toLowerCase();
  const filtered = needle
    ? orders.filter((o) =>
        [
          o.messes?.name,
          o.tiffin_type,
          ...(o.order_shares ?? []).map((s) => names[s.user_id]),
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(needle)),
      )
    : orders;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>Orders</h1>
          <p className="mb-5 text-muted-foreground">Every tiffin logged this month</p>
        </div>
        <div className="flex w-full flex-col items-stretch gap-2.5 sm:w-auto sm:flex-row sm:items-center">
          <MonthPicker month={month} />
          <Button asChild>
            <Link href="/orders/new">+ Log a tiffin</Link>
          </Button>
        </div>
      </div>

      {/* A plain GET form, so search works without JavaScript and the result is
          a URL you can send to someone. The month rides along as a hidden
          field, or searching would silently reset the month. */}
      <form method="get" className="mb-5">
        <input type="hidden" name="month" value={month} />
        <label className="flex items-center gap-2 rounded-md border border-input bg-card px-3 shadow-card transition-colors focus-within:ring-2 focus-within:ring-ring sm:max-w-[320px]">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Search this month&apos;s orders</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search a person or mess"
            className="min-h-[44px] w-full flex-1 border-0 bg-transparent py-2 text-sm text-foreground focus-visible:outline-none sm:min-h-0"
          />
        </label>
      </form>

      {filtered.length === 0 ? (
        q ? (
          <EmptyState
            icon={SearchX}
            title={`Nothing matches “${q}”`}
            body="Try a person's name, or the name of a mess."
          />
        ) : (
          <EmptyState
            icon={ReceiptText}
            title={`Nothing logged for ${prettyMonth(month)}`}
            body="Log a tiffin and everyone's share of it lands here."
            action={
              <Button asChild>
                <Link href="/orders/new">Log a tiffin</Link>
              </Button>
            }
          />
        )
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
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Split between</TableHead>
                  <TableHead>Logged by</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>{prettyDate(o.order_date)}</TableCell>
                    <TableCell>{o.messes?.name ?? "—"}</TableCell>
                    <TableCell>
                      <Portion type={o.tiffin_type} />
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {money(o.unit_price)}
                    </TableCell>
                    <TableCell>
                      {(o.order_shares ?? [])
                        .map((s) => `${names[s.user_id] ?? "—"} ${money(s.share_amount)}`)
                        .join(" · ")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {names[o.created_by] ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {canDelete(o.created_by) && (
                        <form action={deleteOrder}>
                          <input type="hidden" name="id" value={o.id} />
                          <ConfirmButton
                            variant="outline"
                            size="sm"
                            className={DELETE_CLASS}
                            confirmLabel="Tap again to delete"
                          >
                            Delete
                          </ConfirmButton>
                        </form>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile: cards */}
          <div className="md:hidden">
            {filtered.map((o) => (
              <Card key={o.id} className="mb-[18px] px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">{prettyDate(o.order_date)}</span>
                  <Portion type={o.tiffin_type} />
                  <span className="fig font-semibold">{money(o.unit_price)}</span>
                </div>
                <div className="mt-1.5 font-semibold">{o.messes?.name ?? "—"}</div>
                <div className="mt-0.5 text-sm text-muted-foreground">
                  {(o.order_shares ?? [])
                    .map((s) => `${names[s.user_id] ?? "—"} ${money(s.share_amount)}`)
                    .join(" · ")}
                </div>
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">
                    Logged by {names[o.created_by] ?? "—"}
                  </span>
                  {canDelete(o.created_by) && (
                    <form action={deleteOrder}>
                      <input type="hidden" name="id" value={o.id} />
                      <ConfirmButton
                        variant="outline"
                        size="sm"
                        className={DELETE_CLASS}
                        confirmLabel="Tap again"
                      >
                        Delete
                      </ConfirmButton>
                    </form>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
}
