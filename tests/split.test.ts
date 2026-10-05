import { describe, it, expect } from "vitest";
import { planGroup, planTotal, planPerPerson } from "@/lib/split";

const A = "aaa", B = "bbb", C = "ccc", D = "ddd", E = "eee";

describe("planGroup — pairs mode", () => {
  it("4 eating -> 2 full tiffins, everyone pays half a full", () => {
    const plan = planGroup([A, B, C, D], 90, 65, "pairs");
    expect(plan.needsHalfPick).toBe(false);
    expect(plan.orders).toHaveLength(2);
    expect(plan.orders.every((o) => o.tiffin_type === "full")).toBe(true);
    const per = planPerPerson(plan.orders);
    expect(per).toEqual({ [A]: 45, [B]: 45, [C]: 45, [D]: 45 });
    expect(planTotal(plan.orders)).toBe(180);
  });

  it("2 eating -> 1 full tiffin", () => {
    const plan = planGroup([A, B], 90, 65, "pairs");
    expect(plan.orders).toHaveLength(1);
    expect(planPerPerson(plan.orders)).toEqual({ [A]: 45, [B]: 45 });
  });

  it("3 eating without a half-pick -> asks, and plans nothing", () => {
    const plan = planGroup([A, B, C], 90, 65, "pairs", null);
    expect(plan.needsHalfPick).toBe(true);
    expect(plan.orders).toHaveLength(0);
  });

  it("3 eating with C on the half -> 1 full + 1 half, C pays the half", () => {
    const plan = planGroup([A, B, C], 90, 65, "pairs", C);
    expect(plan.needsHalfPick).toBe(false);
    expect(plan.orders).toHaveLength(2);
    expect(planTotal(plan.orders)).toBe(155);
    const per = planPerPerson(plan.orders);
    expect(per[A]).toBe(45);
    expect(per[B]).toBe(45);
    expect(per[C]).toBe(65);
  });

  it("5 eating -> 2 fulls + 1 half for the chosen person", () => {
    const plan = planGroup([A, B, C, D, E], 90, 65, "pairs", E);
    expect(plan.orders).toHaveLength(3);
    expect(planTotal(plan.orders)).toBe(245);
    const per = planPerPerson(plan.orders);
    expect(per[E]).toBe(65);
    expect(per[A]).toBe(45);
  });

  it("1 eating -> half alone (after naming them)", () => {
    const plan = planGroup([A], 90, 65, "pairs", A);
    expect(plan.orders).toHaveLength(1);
    expect(plan.orders[0].tiffin_type).toBe("half");
    expect(planPerPerson(plan.orders)).toEqual({ [A]: 65 });
  });
});

describe("planGroup — all-half mode", () => {
  it("3 eating -> 3 halves at the half price", () => {
    const plan = planGroup([A, B, C], 90, 65, "all-half");
    expect(plan.orders).toHaveLength(3);
    expect(plan.orders.every((o) => o.tiffin_type === "half")).toBe(true);
    expect(planPerPerson(plan.orders)).toEqual({ [A]: 65, [B]: 65, [C]: 65 });
    expect(planTotal(plan.orders)).toBe(195);
  });
});

describe("planGroup — edge cases", () => {
  it("nobody eating -> empty plan, no half needed", () => {
    const plan = planGroup([], 90, 65, "pairs");
    expect(plan.orders).toHaveLength(0);
    expect(plan.needsHalfPick).toBe(false);
  });

  it("an odd-pick who isn't in the group is ignored", () => {
    const plan = planGroup([A, B, C], 90, 65, "pairs", "zzz");
    expect(plan.needsHalfPick).toBe(true);
  });

  it("respects a mess with different prices", () => {
    const plan = planGroup([A, B, C], 100, 70, "pairs", C);
    const per = planPerPerson(plan.orders);
    expect(per[A]).toBe(50);
    expect(per[C]).toBe(70);
    expect(planTotal(plan.orders)).toBe(170);
  });
});
