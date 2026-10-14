import { ArrowLeftRight, CheckCircle2, Undo2 } from "lucide-react";

import {
  getMonthOrders,
  getMembers,
  getMonthSettlements,
  nameMap,
  currentMonthLabel,
} from "@/lib/data";
import { money, prettyMonth, prettyDate } from "@/lib/format";
import { duesForMonth, outstandingFor } from "@/lib/settle";
import MonthPicker from "@/components/MonthPicker";
import Avatar from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { recordSettlement, undoSettlement } from "./actions";

export const metadata = { title: "Settle up" };

type SearchParams = { month?: string };

/**
 * Who owes whom, and what has already been paid.
 *
 * The Bills screen says what each person's share adds up to, which is only half
 * the story - the money actually moves between people, in a WhatsApp thread and
 * a UPI transfer, and nothing recorded it. So this screen answers the question
 * the group actually asks: who still needs to pay whom, and how much.
 *
 * Every line has one action, "Mark received", because that is the whole
 * interaction. Anything cleverer would be more correct and less used.
 */
export default async function SettlementsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const month =
    typeof searchParams?.month === "string" ? searchParams.month : currentMonthLabel();

  const [orders, members, settlements] = await Promise.all([
    getMonthOrders(month),
    getMembers(),
    getMonthSettlements(month),
  ]);

  const names = nameMap(members);
  const dues = duesForMonth(orders, settlements);
  const outstanding = dues.reduce((a, d) => a + d.amount, 0);

  // Only people who are actually in the red or the black, so the summary is not
  // padded with six rows of zero.
  const balances = members
    .map((m) => ({ id: m.id, name: names[m.id] ?? "—", amount: outstandingFor(m.id, dues) }))
    .filter((b) => Math.abs(b.amount) > 0.005)
    .sort((a, b) => b.amount - a.amount);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>Settle up</h1>
          <p className="mb-5 text-muted-foreground">
            Who pays whom for {prettyMonth(month)}
          </p>
        </div>
        <MonthPicker month={month} />
      </div>

      {dues.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={
            orders.length === 0
              ? `Nothing to settle for ${prettyMonth(month)}`
              : "Everyone's square"
          }
          body={
            orders.length === 0
              ? "Once tiffins are logged for the month, this works out who owes whom."
              : "Every share for this month has been marked received."
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {dues.map((d) => (
              <Card key={`${d.from}-${d.to}`} className="px-5 py-[18px] max-md:px-4">
                {/* Two rows, not one. Two avatars, two names, an arrow and an
                    amount do not fit across a 390px phone - the names were
                    being cut to "Prathamesh Kul...", which is worse than a
                    taller card. */}
                <div className="flex items-center gap-2.5">
                  <Avatar name={names[d.from] ?? "?"} size="sm" />
                  <span className="font-semibold">{names[d.from]}</span>
                  <ArrowLeftRight
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Avatar name={names[d.to] ?? "?"} size="sm" />
                  <span className="font-semibold">{names[d.to]}</span>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="fig text-[1.15rem] font-semibold">{money(d.amount)}</span>
                  <form action={recordSettlement}>
                    <input type="hidden" name="from_user" value={d.from} />
                    <input type="hidden" name="to_user" value={d.to} />
                    <input type="hidden" name="amount" value={d.amount} />
                    <input type="hidden" name="period_month" value={month} />
                    <Button type="submit" size="sm" variant="outline">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Mark received
                    </Button>
                  </form>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-5 flex flex-wrap items-center justify-between gap-3 px-5 py-[18px]">
            <strong>Still to settle</strong>
            <span className="fig font-semibold">{money(outstanding)}</span>
          </Card>
        </>
      )}

      {balances.length > 0 && (
        <>
          <h2>Where everyone stands</h2>
          <Card className="divide-y">
            {balances.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between gap-3 px-5 py-3 first:rounded-t-xl last:rounded-b-xl"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Avatar name={b.name} size="sm" />
                  <span className="truncate font-medium">{b.name}</span>
                </span>
                <span
                  className={
                    "fig font-semibold " + (b.amount > 0 ? "text-warn" : "text-good")
                  }
                >
                  {b.amount > 0 ? `owes ${money(b.amount)}` : `is owed ${money(-b.amount)}`}
                </span>
              </div>
            ))}
          </Card>
        </>
      )}

      {settlements.length > 0 && (
        <>
          <h2>Already settled</h2>
          <div className="space-y-3">
            {settlements.map((s) => (
              <Card key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 max-md:px-4">
                <div className="min-w-0">
                  <div className="font-medium">
                    {names[s.from_user] ?? "—"} paid {names[s.to_user] ?? "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {prettyDate(s.settled_on)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="fig font-semibold">{money(s.amount)}</span>
                  <form action={undoSettlement}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="period_month" value={month} />
                    <Button type="submit" size="sm" variant="ghost" aria-label="Undo this settlement">
                      <Undo2 className="h-4 w-4" aria-hidden="true" />
                      Undo
                    </Button>
                  </form>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
}
