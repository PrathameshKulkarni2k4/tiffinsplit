import type { Mess } from "@/lib/types";

/**
 * What a basket of fulls and halves costs at a mess's current prices.
 *
 * Extracted from the form so it can be tested. It is three lines of
 * arithmetic, but they decide how much money changes hands, and a slip there
 * is invisible until somebody has paid the wrong amount - which is the worst
 * kind of bug this app can have.
 *
 * Counts are floored and clamped at zero: a negative or fractional number of
 * tiffins is not a thing, and a text field will happily offer one.
 */
export function basketPrice(
  fulls: number,
  halves: number,
  mess: Pick<Mess, "full_price" | "half_price">,
): number {
  const f = Math.max(0, Math.floor(Number(fulls) || 0));
  const h = Math.max(0, Math.floor(Number(halves) || 0));
  const paise = f * Math.round(Number(mess.full_price) * 100) + h * Math.round(Number(mess.half_price) * 100);
  return paise / 100;
}
