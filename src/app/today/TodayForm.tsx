"use client";

import { useMemo, useState } from "react";
import { planGroup, planTotal, type PlannedOrder, type TodayGroup } from "@/lib/split";
import { money, todayISO } from "@/lib/format";
import type { AppUser, Mess } from "@/lib/types";
import SubmitButton from "@/components/SubmitButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { logToday } from "./actions";

function summaryLines(orders: PlannedOrder[]) {
  const lines: { label: string; amount: string }[] = [];
  const fulls = orders.filter((o) => o.tiffin_type === "full");
  const halves = orders.filter((o) => o.tiffin_type === "half");
  if (fulls.length) {
    lines.push({
      label: `${fulls.length} full tiffin${fulls.length > 1 ? "s" : ""} · shared by 2`,
      amount: `${money(fulls[0].unit_price / 2)} each`,
    });
  }
  if (halves.length) {
    lines.push({
      label: `${halves.length} half tiffin${halves.length > 1 ? "s" : ""} · one each`,
      amount: `${money(halves[0].unit_price)} each`,
    });
  }
  return lines;
}

const LABEL = "mb-2 mt-4 text-[0.82rem] font-bold uppercase tracking-wide text-muted-foreground";
const SELECT =
  "min-h-[44px] rounded-md border border-input bg-card px-2.5 py-2 text-sm font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:min-h-0";

export default function TodayForm({
  messes,
  members,
  loggedMessesByDate,
  usualByMess,
}: {
  messes: Mess[];
  members: AppUser[];
  loggedMessesByDate: Record<string, string[]>;
  usualByMess: Record<string, TodayGroup>;
}) {
  // Nobody eats from two messes in a day. The page already assigns each person
  // to the mess they last ate from, so a mess's own crowd never overlaps - but
  // a mess with no history falls back to "everyone", and that must not re-tick
  // someone another mess has already claimed.
  const claimed = new Set(Object.values(usualByMess).flatMap((g) => g.present));
  const unclaimed = members.filter((m) => !claimed.has(m.id)).map((m) => m.id);

  // The usual group for a mess: its last crowd, how it split, and who took the
  // half. Falls back to whoever is not already claimed elsewhere, rather than
  // showing an empty group or duplicating people across messes.
  const usualFor = (messId: string): TodayGroup => {
    const usual = usualByMess[messId];
    return {
      messId,
      present: usual?.present?.length ? [...usual.present] : [...unclaimed],
      mode: usual?.mode ?? "pairs",
      oddUser: usual?.oddUser ?? null,
    };
  };

  // The form's starting point, in one place so the initial state and Reset
  // cannot drift apart.
  const startingGroups = (): TodayGroup[] => [usualFor(messes[0]?.id ?? "")];

  const [date, setDate] = useState(todayISO());
  const [allowDuplicate, setAllowDuplicate] = useState(false);
  const [groups, setGroups] = useState<TodayGroup[]>(startingGroups);

  const nameOf = useMemo(() => {
    const map: Record<string, string> = {};
    for (const m of members) map[m.id] = m.full_name || m.email;
    return map;
  }, [members]);

  const messOf = useMemo(() => {
    const map: Record<string, Mess> = {};
    for (const m of messes) map[m.id] = m;
    return map;
  }, [messes]);

  function toggle(gi: number, uid: string) {
    setGroups((gs) => {
      const adding = !gs[gi].present.includes(uid);
      return gs.map((g, i) => {
        if (i === gi) {
          const present = adding ? [...g.present, uid] : g.present.filter((x) => x !== uid);
          const oddUser = g.oddUser && present.includes(g.oddUser) ? g.oddUser : null;
          return { ...g, present, oddUser };
        }
        if (adding) {
          // one person can only eat from one mess
          return {
            ...g,
            present: g.present.filter((x) => x !== uid),
            oddUser: g.oddUser === uid ? null : g.oddUser,
          };
        }
        return g;
      });
    });
  }

  const patch = (gi: number, next: Partial<TodayGroup>) =>
    setGroups((gs) => gs.map((g, i) => (i === gi ? { ...g, ...next } : g)));

  // Re-use the starting point. Most days are the same people at the same mess,
  // so this is the escape hatch for when ticking and unticking has gone wrong.
  function applyUsual() {
    setGroups(startingGroups());
  }

  // Only offered once the form has actually been changed - a Reset button on an
  // untouched form is noise.
  const changed = JSON.stringify(groups) !== JSON.stringify(startingGroups());

  const usualSummary = startingGroups()
    .map(
      (g) =>
        `${g.present.length} ${g.present.length === 1 ? "person" : "people"} · ${
          messOf[g.messId]?.name ?? "a mess"
        }`
    )
    .join(", ");

  function addGroup() {
    const used = new Set(groups.map((g) => g.messId));
    const next = messes.find((m) => !used.has(m.id)) ?? messes[0];

    // Someone already in another mess cannot be added again, and if that
    // removes the half-taker, drop the pick so the form asks again.
    const taken = new Set(groups.flatMap((g) => g.present));
    const group = usualFor(next.id);
    const present = group.present.filter((u) => !taken.has(u));
    const oddUser = group.oddUser && present.includes(group.oddUser) ? group.oddUser : null;

    setGroups((gs) => [...gs, { ...group, present, oddUser }]);
  }

  function removeGroup(gi: number) {
    setGroups((gs) => gs.filter((_, i) => i !== gi));
  }

  const plans = groups.map((g) => {
    const mess = messOf[g.messId];
    return planGroup(
      g.present,
      Number(mess?.full_price ?? 0),
      Number(mess?.half_price ?? 0),
      g.mode,
      g.oddUser
    );
  });

  const loggedMesses = loggedMessesByDate[date] ?? [];
  const clashing = groups.filter(
    (g) => g.present.length > 0 && loggedMesses.includes(g.messId)
  );
  const hasClash = clashing.length > 0;
  const clashNames = clashing.map((g) => messOf[g.messId]?.name ?? "a mess").join(", ");

  const valid = groups.every((g, i) => g.present.length > 0 && !plans[i].needsHalfPick);
  const canConfirm = valid && (!hasClash || allowDuplicate);
  const grand = plans.reduce((sum, p) => sum + planTotal(p.orders), 0);
  const payload = JSON.stringify({ date, allowDuplicate, groups });

  return (
    <form action={logToday}>
      <input type="hidden" name="payload" value={payload} />

      <label className="mb-3.5 block font-semibold">
        Date
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1.5 flex min-h-[46px] w-full rounded-md border border-input bg-card px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>

      {changed && (
        <Card className="mb-4 px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold">Reset to the usual</div>
              <div className="text-sm text-muted-foreground">{usualSummary}</div>
            </div>
            <Button type="button" variant="outline" onClick={applyUsual} className="h-11 md:h-9">
              Reset
            </Button>
          </div>
        </Card>
      )}

      {hasClash && (
        <Alert variant="warning" className="mb-4">
          <AlertTitle>Already logged today for {clashNames}.</AlertTitle>
          <AlertDescription>
            <div className="mt-2 flex min-h-[46px] items-center gap-2.5 font-semibold">
              <Checkbox
                id="allow-duplicate"
                checked={allowDuplicate}
                onCheckedChange={(v) => setAllowDuplicate(v === true)}
              />
              <label
                htmlFor="allow-duplicate"
                className="flex flex-1 cursor-pointer items-center self-stretch"
              >
                I know — add these anyway
              </label>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {groups.map((g, gi) => {
        const plan = plans[gi];
        const oddNeeded = g.mode === "pairs" && g.present.length > 0 && g.present.length % 2 === 1;

        return (
          <Card className="mb-[18px] px-4 py-4" key={gi}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <select
                value={g.messId}
                onChange={(e) => patch(gi, { messId: e.target.value })}
                aria-label="Mess"
                className={cn(SELECT, "w-auto max-w-[60%]")}
              >
                {messes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <span className="text-sm text-muted-foreground">{g.present.length} eating</span>
            </div>

            <div className={LABEL}>Who&apos;s eating from here?</div>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => {
                const on = g.present.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={on}
                    className={cn(
                      "min-h-[44px] rounded-full border px-3.5 py-2.5 text-[0.9rem] font-semibold transition-colors",
                      on
                        ? "border-primary bg-accent text-accent-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-input",
                    )}
                    onClick={() => toggle(gi, m.id)}
                  >
                    {nameOf[m.id]}
                  </button>
                );
              })}
            </div>

            <div className={LABEL}>How are we splitting?</div>
            <div className="flex overflow-hidden rounded-lg border">
              <button
                type="button"
                aria-pressed={g.mode === "pairs"}
                className={cn(
                  "min-h-[44px] flex-1 px-2 py-[11px] text-[0.86rem] font-semibold",
                  g.mode === "pairs"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground",
                )}
                onClick={() => patch(gi, { mode: "pairs" })}
              >
                Pairs share a full
              </button>
              <button
                type="button"
                aria-pressed={g.mode === "all-half"}
                className={cn(
                  "min-h-[44px] flex-1 px-2 py-[11px] text-[0.86rem] font-semibold",
                  g.mode === "all-half"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground",
                )}
                onClick={() => patch(gi, { mode: "all-half" })}
              >
                All take a half
              </button>
            </div>

            {g.present.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Pick who&apos;s eating from this mess.
              </p>
            ) : (
              <div className="mt-3.5 border-t pt-2.5 text-[0.92rem]">
                {plan.orders.length > 0 ? (
                  <>
                    {summaryLines(plan.orders).map((l, i) => (
                      <div key={i} className="flex justify-between py-[3px]">
                        <span>{l.label}</span>
                        <span className="fig font-semibold">{l.amount}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-[3px] pt-1.5">
                      <span className="text-sm text-muted-foreground">Group total</span>
                      <span className="fig font-semibold">
                        {money(planTotal(plan.orders))}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Choose who&apos;s taking the half below.
                  </p>
                )}
              </div>
            )}

            {oddNeeded && (
              <>
                <div className={LABEL}>Who&apos;s taking the half?</div>
                <div className="flex flex-wrap gap-2">
                  {g.present.map((uid) => {
                    const on = g.oddUser === uid;
                    return (
                      <button
                        key={uid}
                        type="button"
                        aria-pressed={on}
                        className={cn(
                          "min-h-[44px] rounded-full border px-3.5 py-2.5 text-[0.9rem] font-semibold transition-colors",
                          on
                            ? "border-primary bg-accent text-accent-foreground"
                            : "border-border bg-card text-muted-foreground hover:border-input",
                        )}
                        onClick={() => patch(gi, { oddUser: uid })}
                      >
                        {nameOf[uid]}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {groups.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => removeGroup(gi)}
              >
                Remove this mess
              </Button>
            )}
          </Card>
        );
      })}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={addGroup}
        disabled={groups.length >= messes.length}
      >
        + Add another mess
      </Button>

      <div className="flex items-baseline justify-between px-1 pb-1.5 pt-3.5 text-[1.05rem] font-bold">
        <span>Total today</span>
        <span className="fig font-semibold">{money(grand)}</span>
      </div>

      <SubmitButton pendingLabel="Saving…" disabled={!canConfirm}>
        Confirm today&apos;s lunch
      </SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        Need something different? <a href="/orders/new" className="underline">Add tiffins manually</a>
      </p>
    </form>
  );
}
