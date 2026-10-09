import { splitEqually, round2 } from "./billing";

export type SplitMode = "pairs" | "all-half";

export type PlannedOrder = {
  tiffin_type: "full" | "half";
  unit_price: number;
  sharers: string[];
};

export type Plan = {
  orders: PlannedOrder[];
  /** true when the group is an odd size in pairs mode and no one has been picked for the half yet */
  needsHalfPick: boolean;
};

/**
 * Turn "who is eating from this mess" into the actual tiffins to log.
 *
 *  pairs    - people pair up and share a full tiffin. If there is an odd one out,
 *             that person takes a half on their own.
 *  all-half - everyone takes their own half tiffin.
 *
 * The app never decides *who* takes the half: that is a real ₹ difference, so the
 * caller must name them (oddUserId). Until then the plan reports needsHalfPick.
 */
export function planGroup(
  present: string[],
  fullPrice: number,
  halfPrice: number,
  mode: SplitMode,
  oddUserId?: string | null
): Plan {
  const people = [...present];
  if (people.length === 0) return { orders: [], needsHalfPick: false };

  if (mode === "all-half") {
    return {
      orders: people.map((u) => ({
        tiffin_type: "half" as const,
        unit_price: halfPrice,
        sharers: [u],
      })),
      needsHalfPick: false,
    };
  }

  // pairs mode
  const orders: PlannedOrder[] = [];

  if (people.length % 2 === 0) {
    for (let i = 0; i < people.length; i += 2) {
      orders.push({
        tiffin_type: "full",
        unit_price: fullPrice,
        sharers: [people[i], people[i + 1]],
      });
    }
    return { orders, needsHalfPick: false };
  }

  // odd size: someone has to take the half, and only a human can say who
  if (!oddUserId || !people.includes(oddUserId)) {
    return { orders: [], needsHalfPick: true };
  }

  const rest = people.filter((u) => u !== oddUserId);
  for (let i = 0; i < rest.length; i += 2) {
    orders.push({
      tiffin_type: "full",
      unit_price: fullPrice,
      sharers: [rest[i], rest[i + 1]],
    });
  }
  orders.push({ tiffin_type: "half", unit_price: halfPrice, sharers: [oddUserId] });

  return { orders, needsHalfPick: false };
}

/** What the group will be billed in total (sum of the planned tiffin prices). */
export function planTotal(orders: PlannedOrder[]): number {
  return round2(orders.reduce((sum, o) => sum + o.unit_price, 0));
}

/** What each person owes under a plan. */
export function planPerPerson(orders: PlannedOrder[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const o of orders) {
    for (const s of splitEqually(o.unit_price, o.sharers)) {
      out[s.userId] = round2((out[s.userId] ?? 0) + s.amount);
    }
  }
  return out;
}

/** One mess group on the Today screen: who is eating from this mess, and how it splits. */
export type TodayGroup = {
  messId: string;
  present: string[];
  mode: SplitMode;
  oddUser: string | null;
};

/** An order as stored, with just the sharers needed to rebuild a group. */
export type LoggedOrder = {
  mess_id: string;
  tiffin_type: "full" | "half";
  order_shares: { user_id: string }[];
};

/**
 * The inverse of planGroup: rebuild Today groups from orders already logged, so
 * the same order can be repeated in one tap.
 *
 * Orders are grouped by mess, because the app allows exactly one group per mess
 * in a batch.
 *
 * The split mode is inferred rather than stored. all-half produces one half per
 * person, each taken alone; pairs produces fulls shared by two, plus at most one
 * half taken alone by the odd one out. So a batch of all-single-sharer halves is
 * all-half, and anything else is pairs, with whoever holds a half alone as the
 * odd user.
 *
 * One genuinely ambiguous case: a group of exactly one person in pairs mode also
 * looks like all-half. It does not matter - either reading plans one half taken
 * alone, for the same money.
 */
export function groupsFromOrders(orders: LoggedOrder[]): TodayGroup[] {
  const byMess = new Map<string, LoggedOrder[]>();
  for (const o of orders) {
    const list = byMess.get(o.mess_id);
    if (list) list.push(o);
    else byMess.set(o.mess_id, [o]);
  }

  const groups: TodayGroup[] = [];

  for (const [messId, list] of byMess) {
    const present: string[] = [];
    for (const o of list) {
      for (const s of o.order_shares ?? []) {
        if (!present.includes(s.user_id)) present.push(s.user_id);
      }
    }

    const alone = (o: LoggedOrder) =>
      o.tiffin_type === "half" && (o.order_shares ?? []).length === 1;

    if (list.length > 0 && list.every(alone)) {
      groups.push({ messId, present, mode: "all-half", oddUser: null });
      continue;
    }

    const halfAlone = list.find(alone);
    groups.push({
      messId,
      present,
      mode: "pairs",
      oddUser: halfAlone ? halfAlone.order_shares[0].user_id : null,
    });
  }

  return groups;
}

/**
 * The mess each person most recently ate from, given orders newest-first.
 *
 * A person eats from exactly one mess a day, so this is what decides which
 * mess's crowd they belong to when two messes could both claim them.
 */
export function lastMessByUser(ordersNewestFirst: LoggedOrder[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const o of ordersNewestFirst) {
    for (const s of o.order_shares ?? []) {
      if (!(s.user_id in out)) out[s.user_id] = o.mess_id;
    }
  }
  return out;
}

/**
 * Trim a group to the people who actually belong to it.
 *
 * Without this, the same names get pre-ticked in every mess - someone who ate
 * from one mess on Monday and another on Tuesday appears in both - which the
 * app forbids and the server rejects on submit. The odd user is dropped too if
 * they are no longer in the group, so a stale half-pick cannot survive.
 */
export function keepOwnPeople(
  group: TodayGroup,
  lastMess: Record<string, string>
): TodayGroup {
  const present = group.present.filter((u) => lastMess[u] === group.messId);
  return {
    ...group,
    present,
    oddUser: group.oddUser && present.includes(group.oddUser) ? group.oddUser : null,
  };
}
