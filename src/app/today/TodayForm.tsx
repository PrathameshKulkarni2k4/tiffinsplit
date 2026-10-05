"use client";

import { useMemo, useState } from "react";
import { planGroup, planTotal, type PlannedOrder, type SplitMode } from "@/lib/split";
import { money, todayISO } from "@/lib/format";
import type { AppUser, Mess } from "@/lib/types";
import SubmitButton from "@/components/SubmitButton";
import { logToday } from "./actions";

type Group = { messId: string; present: string[]; mode: SplitMode; oddUser: string | null };

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

export default function TodayForm({
  messes,
  members,
  todayMesses,
}: {
  messes: Mess[];
  members: AppUser[];
  todayMesses: string[];
}) {
  const [date, setDate] = useState(todayISO());
  const [allowDuplicate, setAllowDuplicate] = useState(false);
  const [groups, setGroups] = useState<Group[]>([
    { messId: messes[0]?.id ?? "", present: members.map((m) => m.id), mode: "pairs", oddUser: null },
  ]);

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

  const patch = (gi: number, next: Partial<Group>) =>
    setGroups((gs) => gs.map((g, i) => (i === gi ? { ...g, ...next } : g)));

  function addGroup() {
    const used = new Set(groups.map((g) => g.messId));
    const next = messes.find((m) => !used.has(m.id)) ?? messes[0];
    setGroups((gs) => [...gs, { messId: next.id, present: [], mode: "pairs", oddUser: null }]);
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

  const isToday = date === todayISO();
  const clashing = isToday
    ? groups.filter((g) => g.present.length > 0 && todayMesses.includes(g.messId))
    : [];
  const hasClash = clashing.length > 0;
  const clashNames = clashing.map((g) => messOf[g.messId]?.name ?? "a mess").join(", ");

  const valid = groups.every((g, i) => g.present.length > 0 && !plans[i].needsHalfPick);
  const canConfirm = valid && (!hasClash || allowDuplicate);
  const grand = plans.reduce((sum, p) => sum + planTotal(p.orders), 0);
  const payload = JSON.stringify({ date, allowDuplicate, groups });

  return (
    <form action={logToday} className="today-form">
      <input type="hidden" name="payload" value={payload} />

      <label className="datefield">
        Date
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>

      {hasClash && (
        <div className="warnbox">
          <strong>Already logged today for {clashNames}.</strong>
          <label className="check">
            <input
              type="checkbox"
              checked={allowDuplicate}
              onChange={(e) => setAllowDuplicate(e.target.checked)}
            />
            I know — add these anyway
          </label>
        </div>
      )}

      {groups.map((g, gi) => {
        const plan = plans[gi];
        const oddNeeded = g.mode === "pairs" && g.present.length > 0 && g.present.length % 2 === 1;

        return (
          <div className="card group" key={gi}>
            <div className="row grouphead">
              <select
                value={g.messId}
                onChange={(e) => patch(gi, { messId: e.target.value })}
                aria-label="Mess"
              >
                {messes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <span className="muted">{g.present.length} eating</span>
            </div>

            <div className="label">Who&apos;s eating from here?</div>
            <div className="chips">
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={g.present.includes(m.id)}
                  className={`chip${g.present.includes(m.id) ? " on" : ""}`}
                  onClick={() => toggle(gi, m.id)}
                >
                  {nameOf[m.id]}
                </button>
              ))}
            </div>

            <div className="label">How are we splitting?</div>
            <div className="seg">
              <button
                type="button"
                aria-pressed={g.mode === "pairs"}
                className={g.mode === "pairs" ? "on" : ""}
                onClick={() => patch(gi, { mode: "pairs" })}
              >
                Pairs share a full
              </button>
              <button
                type="button"
                aria-pressed={g.mode === "all-half"}
                className={g.mode === "all-half" ? "on" : ""}
                onClick={() => patch(gi, { mode: "all-half" })}
              >
                All take a half
              </button>
            </div>

            {g.present.length === 0 ? (
              <p className="muted">Pick who&apos;s eating from this mess.</p>
            ) : (
              <div className="split">
                {plan.orders.length > 0 ? (
                  <>
                    {summaryLines(plan.orders).map((l, i) => (
                      <div key={i}>
                        <span>{l.label}</span>
                        <span className="amount">{l.amount}</span>
                      </div>
                    ))}
                    <div style={{ paddingTop: 6 }}>
                      <span className="muted">Group total</span>
                      <span className="amount">{money(planTotal(plan.orders))}</span>
                    </div>
                  </>
                ) : (
                  <p className="muted">Choose who&apos;s taking the half below.</p>
                )}
              </div>
            )}

            {oddNeeded && (
              <>
                <div className="label">Who&apos;s taking the half?</div>
                <div className="chips">
                  {g.present.map((uid) => (
                    <button
                      key={uid}
                      type="button"
                      aria-pressed={g.oddUser === uid}
                      className={`chip${g.oddUser === uid ? " on" : ""}`}
                      onClick={() => patch(gi, { oddUser: uid })}
                    >
                      {nameOf[uid]}
                    </button>
                  ))}
                </div>
              </>
            )}

            {groups.length > 1 && (
              <button
                type="button"
                className="btn small"
                onClick={() => removeGroup(gi)}
                style={{ marginTop: 12 }}
              >
                Remove this mess
              </button>
            )}
          </div>
        );
      })}

      <button
        type="button"
        className="btn addmess"
        onClick={addGroup}
        disabled={groups.length >= messes.length}
      >
        + Add another mess
      </button>

      <div className="total-row">
        <span>Total today</span>
        <span className="amount">{money(grand)}</span>
      </div>

      <SubmitButton pendingLabel="Saving…" disabled={!canConfirm}>
        Confirm today&apos;s lunch
      </SubmitButton>
      <p className="muted" style={{ textAlign: "center" }}>
        Need something different? <a href="/orders/new">Add tiffins manually</a>
      </p>
    </form>
  );
}
