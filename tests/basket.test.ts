import { describe, it, expect } from "vitest";

import { basketPrice } from "@/lib/basket";
import { splitEqually } from "@/lib/billing";

const SONAVANE = { full_price: 100, half_price: 70 };
// The prices that were live on 15 Oct, when the real basket order was logged.
const SONAVANE_OLD = { full_price: 100, half_price: 50 };
const KRISHNA = { full_price: 90, half_price: 65 };

describe("basketPrice", () => {
  it("1 full + 1 half at Sonavane -> 170", () => {
    expect(basketPrice(1, 1, SONAVANE)).toBe(170);
  });

  it("reproduces the 15 Oct order at the prices live that day -> 150", () => {
    // The real order: 1 full + 1 half, split three ways, logged at 150.
    // This is the case the feature exists for, so it is the case to pin.
    expect(basketPrice(1, 1, SONAVANE_OLD)).toBe(150);
  });

  it("2 fulls at Krishna -> 180", () => {
    expect(basketPrice(2, 0, KRISHNA)).toBe(180);
  });

  it("3 halves at Sonavane -> 210", () => {
    expect(basketPrice(0, 3, SONAVANE)).toBe(210);
  });

  it("fulls and halves combine, not one or the other", () => {
    // 2 fulls (200) + 3 halves (210) = 410, not 200 and not 210.
    expect(basketPrice(2, 3, SONAVANE)).toBe(410);
  });

  it("nothing selected -> 0", () => {
    expect(basketPrice(0, 0, SONAVANE)).toBe(0);
  });

  it("ignores negatives, which a number input can produce", () => {
    expect(basketPrice(-2, -2, SONAVANE)).toBe(0);
    expect(basketPrice(-2, 1, SONAVANE)).toBe(70);
  });

  it("floors fractions, because half a tiffin is not a tiffin", () => {
    expect(basketPrice(1.9, 1.9, SONAVANE)).toBe(170);
  });

  it("stays exact in paise when prices are not whole rupees", () => {
    const odd = { full_price: 21.67, half_price: 10.83 };
    // 3 * 21.67 = 65.01, and 0.1 + 0.2 style float drift must not appear.
    expect(basketPrice(3, 0, odd)).toBe(65.01);
    expect(basketPrice(0, 3, odd)).toBe(32.49);
  });

  it("a basket split three ways still sums to the basket total", () => {
    // The end-to-end invariant: whatever the basket costs, the shares add up
    // to it exactly. This is what splitEqually already guarantees, checked here
    // against a basket total rather than a single tiffin price.
    const total = basketPrice(1, 1, SONAVANE);
    const shares = splitEqually(total, ["a", "b", "c"]);
    const sum = shares.reduce((acc, s) => acc + Math.round(s.amount * 100), 0);
    expect(sum).toBe(Math.round(total * 100));
    // Compared as a sorted multiset, not in order: the contract that matters is
    // that the parts add up and that nobody is charged more than a paisa off,
    // not which sharer the odd paisa lands on.
    expect(shares.map((s) => s.amount).sort((a, b) => a - b)).toEqual([56.66, 56.67, 56.67]);
  });
});
