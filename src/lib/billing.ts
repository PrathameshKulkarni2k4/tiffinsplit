/**
 * TiffinSplit billing engine.
 *
 * The whole point of the app is to split a tiffin's price equally among the
 * people who shared it, while keeping every rupee and paisa accounted for.
 * A naive `price / n` loses or invents paise when the split is not exact
 * (e.g. 65 / 3). The rule below keeps the total exact to the paise.
 */

export type Share = { userId: string; amount: number };

/** Round to two decimals, avoiding binary floating-point drift. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Split `unitPrice` (in rupees) equally among `sharerIds`.
 *
 * Algorithm:
 *   1. Work in integer paise: paise = round(unitPrice * 100).
 *   2. base = floor(paise / n); remainder = paise - base * n.
 *   3. Every sharer gets `base` paise; the first `remainder` sharers
 *      (ordered by user id, for determinism) each get one extra paisa.
 *   4. Convert back to rupees.
 *
 * The returned amounts always sum exactly to `unitPrice`.
 */
export function splitEqually(unitPrice: number, sharerIds: string[]): Share[] {
  const n = sharerIds.length;
  if (n === 0) return [];
  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    throw new Error("unitPrice must be a non-negative number");
  }

  const paise = Math.round(unitPrice * 100);
  const base = Math.floor(paise / n);
  const remainder = paise - base * n; // 0 .. n-1

  return [...sharerIds]
    .sort() // deterministic order so the same input always gives the same split
    .map((userId, i) => ({
      userId,
      amount: (base + (i < remainder ? 1 : 0)) / 100,
    }));
}

export type OrderWithShares = {
  id: string;
  mess_id: string;
  unit_price: number;
  order_date: string;
  shares: { user_id: string; share_amount: number }[];
};

/** Total each member owes for the given orders. */
export function personMonthlyTotals(orders: OrderWithShares[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const o of orders) {
    for (const s of o.shares) {
      totals[s.user_id] = round2((totals[s.user_id] ?? 0) + Number(s.share_amount));
    }
  }
  return totals;
}

/** Total owed to each mess for the given orders. */
export function messMonthlyTotals(orders: OrderWithShares[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const o of orders) {
    totals[o.mess_id] = round2((totals[o.mess_id] ?? 0) + Number(o.unit_price));
  }
  return totals;
}

/** Convenience: sum an array of shares (used by tests and the balance check). */
export function sumShares(shares: Share[]): number {
  return round2(shares.reduce((acc, s) => acc + s.amount, 0));
}
