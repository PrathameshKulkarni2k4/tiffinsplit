import type { OrderWithDetails, Settlement } from "@/lib/types";

/**
 * Who owes whom, for one month.
 *
 * The rule the group actually follows: one person pays the mess, and everyone
 * else pays that person back their share. So for each order, `created_by` is
 * the person who fronted the money, and every other sharer owes them their
 * share_amount.
 *
 * Two things are then netted, and both matter for the number to be believable:
 *
 *   1. Settlements already recorded for the month are subtracted.
 *   2. Opposing pairs are collapsed. If Aarav owes Kabir 200 and Kabir owes
 *      Aarav 50, the group does not want to see two lines and work out the
 *      difference - they want one line saying Aarav owes Kabir 150.
 *
 * Money is compared in paise so that floating-point noise does not leave a
 * phantom 0.0000001-rupee debt on the screen.
 */
export type Due = { from: string; to: string; amount: number };

const PAISE = 100;

function round(n: number): number {
  return Math.round(n * PAISE) / PAISE;
}

export function duesForMonth(
  orders: OrderWithDetails[],
  settlements: Settlement[],
): Due[] {
  // Keyed "from|to". A negative balance here means the debt runs the other way.
  const net = new Map<string, number>();

  const add = (from: string, to: string, amount: number) => {
    const key = `${from}|${to}`;
    net.set(key, (net.get(key) ?? 0) + amount);
  };

  for (const order of orders) {
    const payer = order.created_by;
    for (const share of order.order_shares ?? []) {
      // The payer does not owe themselves for their own order.
      if (share.user_id === payer) continue;
      add(share.user_id, payer, Number(share.share_amount));
    }
  }

  for (const s of settlements) {
    add(s.from_user, s.to_user, -Number(s.amount));
  }

  const seen = new Set<string>();
  const out: Due[] = [];

  for (const [key, value] of net) {
    if (seen.has(key)) continue;
    const [a, b] = key.split("|");
    seen.add(`${a}|${b}`);
    seen.add(`${b}|${a}`);

    const forward = value;
    const backward = net.get(`${b}|${a}`) ?? 0;
    const settled = round(forward - backward);

    if (settled > 0.005) out.push({ from: a, to: b, amount: settled });
    else if (settled < -0.005) out.push({ from: b, to: a, amount: -settled });
  }

  // Largest debt first - that is the one worth acting on.
  return out.sort((x, y) => y.amount - x.amount);
}

/** What one person still owes the group, after settlements. */
export function outstandingFor(personId: string, dues: Due[]): number {
  let owed = 0;
  for (const d of dues) {
    if (d.from === personId) owed += d.amount;
    if (d.to === personId) owed -= d.amount;
  }
  return round(owed);
}
