import { describe, it, expect } from "vitest";
import {
  splitEqually,
  sumShares,
  personMonthlyTotals,
  messMonthlyTotals,
  type OrderWithShares,
} from "@/lib/billing";

function shares(price: number, n: number) {
  const ids = Array.from({ length: n }, (_, i) => `user-${i}`);
  return splitEqually(price, ids);
}
function values(price: number, n: number) {
  return shares(price, n).map((s) => s.amount);
}

describe("splitEqually", () => {
  it("TC-M01 full 90 shared by 2 -> 45 each", () => {
    expect(values(90, 2)).toEqual([45, 45]);
  });
  it("TC-M02 half 65 eaten alone -> 65", () => {
    expect(values(65, 1)).toEqual([65]);
  });
  it("TC-M03 half 65 shared by 2 -> 32.50 each", () => {
    expect(values(65, 2)).toEqual([32.5, 32.5]);
  });
  it("TC-M04 full 90 shared by 3 -> 30 each", () => {
    expect(values(90, 3)).toEqual([30, 30, 30]);
  });
  it("TC-M05 half 65 shared by 3 -> 21.67, 21.67, 21.66 (sum 65)", () => {
    const v = values(65, 3);
    expect(sumShares(shares(65, 3))).toBe(65);
    expect(v.filter((x) => x === 21.67)).toHaveLength(2);
    expect(v.filter((x) => x === 21.66)).toHaveLength(1);
  });
  it("TC-M06 full 90 shared by 4 -> 22.50 each", () => {
    expect(values(90, 4)).toEqual([22.5, 22.5, 22.5, 22.5]);
  });
  it("TC-M07 full 90 shared by 6 -> 15 each", () => {
    expect(values(90, 6)).toEqual([15, 15, 15, 15, 15, 15]);
  });
  it("TC-M08 half 65 shared by 4 -> 16.25 each", () => {
    expect(values(65, 4)).toEqual([16.25, 16.25, 16.25, 16.25]);
  });
  it("TC-M09 half 65 shared by 6 -> 10.84 x2, 10.83 x4 (sum 65)", () => {
    const v = values(65, 6);
    expect(sumShares(shares(65, 6))).toBe(65);
    expect(v.filter((x) => x === 10.84)).toHaveLength(2);
    expect(v.filter((x) => x === 10.83)).toHaveLength(4);
  });
  it("TC-M10 price overridden to 100 shared by 2 -> 50 each", () => {
    expect(values(100, 2)).toEqual([50, 50]);
  });

  it("every split sums exactly to the price (property check)", () => {
    const prices = [90, 65, 100, 45, 70, 33.33, 12.5, 199.99, 0];
    for (const price of prices) {
      for (let n = 1; n <= 6; n++) {
        expect(sumShares(shares(price, n))).toBe(price);
      }
    }
  });

  it("no sharers -> empty list", () => {
    expect(splitEqually(90, [])).toEqual([]);
  });

  it("rejects a negative price", () => {
    expect(() => splitEqually(-1, ["a"])).toThrow();
  });

  it("is deterministic regardless of the order of sharers", () => {
    expect(splitEqually(65, ["b", "a", "c"])).toEqual(splitEqually(65, ["c", "b", "a"]));
  });
});

describe("aggregation", () => {
  const twoOrders: OrderWithShares[] = [
    {
      id: "o1",
      mess_id: "m1",
      unit_price: 90,
      order_date: "2026-10-01",
      shares: [
        { user_id: "a", share_amount: 45 },
        { user_id: "b", share_amount: 45 },
      ],
    },
    {
      id: "o2",
      mess_id: "m2",
      unit_price: 65,
      order_date: "2026-10-02",
      shares: [
        { user_id: "a", share_amount: 32.5 },
        { user_id: "b", share_amount: 32.5 },
      ],
    },
  ];

  it("TC-M13 person totals equal the sum of their shares", () => {
    const totals = personMonthlyTotals(twoOrders);
    expect(totals.a).toBe(77.5);
    expect(totals.b).toBe(77.5);
  });

  it("TC-M14 mess totals equal the sum of that mess's order prices", () => {
    const totals = messMonthlyTotals(twoOrders);
    expect(totals.m1).toBe(90);
    expect(totals.m2).toBe(65);
  });

  it("TC-M15 invariant: sum of person dues equals sum of mess totals", () => {
    const orders: OrderWithShares[] = [
      {
        id: "o1",
        mess_id: "m1",
        unit_price: 90,
        order_date: "2026-10-01",
        shares: splitEqually(90, ["a", "b"]).map((s) => ({ user_id: s.userId, share_amount: s.amount })),
      },
      {
        id: "o2",
        mess_id: "m2",
        unit_price: 65,
        order_date: "2026-10-02",
        shares: splitEqually(65, ["a", "b", "c"]).map((s) => ({
          user_id: s.userId,
          share_amount: s.amount,
        })),
      },
    ];
    const people = Object.values(personMonthlyTotals(orders)).reduce(
      (x, y) => Math.round((x + y) * 100) / 100,
      0
    );
    const vendors = Object.values(messMonthlyTotals(orders)).reduce(
      (x, y) => Math.round((x + y) * 100) / 100,
      0
    );
    expect(people).toBe(vendors);
    expect(people).toBe(155);
  });
});
