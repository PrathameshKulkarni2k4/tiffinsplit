import type { OrderWithDetails } from "@/lib/types";
import {
  personMonthlyTotals,
  messMonthlyTotals,
  type OrderWithShares,
} from "@/lib/billing";

/** Normalise joined orders into the shape the billing engine expects. */
export function toShares(orders: OrderWithDetails[]): OrderWithShares[] {
  return orders.map((o) => ({
    id: o.id,
    mess_id: o.mess_id,
    unit_price: Number(o.unit_price),
    order_date: o.order_date,
    shares: (o.order_shares ?? []).map((s) => ({
      user_id: s.user_id,
      share_amount: Number(s.share_amount),
    })),
  }));
}

export function perPerson(orders: OrderWithDetails[]): Record<string, number> {
  return personMonthlyTotals(toShares(orders));
}

export function perMess(orders: OrderWithDetails[]): Record<string, number> {
  return messMonthlyTotals(toShares(orders));
}

/** Grand total for the month (sum of every order's price). */
export function grandTotal(orders: OrderWithDetails[]): number {
  return Math.round(orders.reduce((a, o) => a + Number(o.unit_price), 0) * 100) / 100;
}
