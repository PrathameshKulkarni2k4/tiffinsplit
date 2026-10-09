import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getMonthOrders, getMembers, nameMap, currentMonthLabel } from "@/lib/data";
import { money, prettyDate } from "@/lib/format";
import MonthPicker from "@/components/MonthPicker";
import ConfirmButton from "@/components/ConfirmButton";
import { deleteOrder, undoBatch } from "./actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SearchParams = { month?: string; logged?: string; batch?: string };

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

      {typeof searchParams?.logged === "string" && (
        <Alert variant="success" className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <AlertDescription className="font-semibold">
            Logged {searchParams.logged} tiffin{searchParams.logged === "1" ? "" : "s"} today.
          </AlertDescription>
          {typeof searchParams?.batch === "string" && (
            <form action={undoBatch}>
              <input type="hidden" name="batch" value={searchParams.batch} />
              <Button variant="outline" size="sm" type="submit">
                Undo
              </Button>
            </form>
          )}
        </Alert>
      )}

      {orders.length === 0 ? (
        <Card className="px-5 py-[18px]">
          <p className="m-0 text-sm text-muted-foreground">
            No orders this month. <Link href="/orders/new" className="underline">Log the first tiffin.</Link>
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
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Split between</TableHead>
                  <TableHead>Logged by</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
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
            {orders.map((o) => (
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
