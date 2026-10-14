import { createClient } from "@/lib/supabase/server";
import type { AppUser, Mess, OrderWithDetails } from "@/lib/types";

/** Returns the ISO date range (first and last day) for a "YYYY-MM" month. */
export function monthRange(month?: string) {
  const now = new Date();
  const year = month ? Number(month.slice(0, 4)) : now.getFullYear();
  const mon = month ? Number(month.slice(5, 7)) - 1 : now.getMonth();

  const first = new Date(Date.UTC(year, mon, 1));
  const last = new Date(Date.UTC(year, mon + 1, 0));
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  return {
    start: iso(first),
    end: iso(last),
    label: `${year}-${String(mon + 1).padStart(2, "0")}`,
  };
}

export function currentMonthLabel() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** The last `n` months, newest first, as "YYYY-MM" labels. */
export function lastNMonths(n: number): string[] {
  const now = new Date();
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    out.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

/** All orders (with mess name and shares) for a month. */
export async function getMonthOrders(month?: string): Promise<OrderWithDetails[]> {
  const supabase = createClient();
  const { start, end } = monthRange(month);

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_date, mess_id, tiffin_type, unit_price, created_by, notes, created_at, messes(name), order_shares(user_id, share_amount)"
    )
    .gte("order_date", start)
    .lte("order_date", end)
    .order("order_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as OrderWithDetails[];
}

export async function getMembers(): Promise<AppUser[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, avatar_url, role, is_active")
    .eq("is_active", true)
    .order("full_name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as AppUser[];
}

export async function getMesses(activeOnly = true): Promise<Mess[]> {
  const supabase = createClient();
  let query = supabase
    .from("messes")
    .select("id, name, full_price, half_price, is_active")
    .order("name", { ascending: true });
  if (activeOnly) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Mess[];
}

/** Per-month order count and group total for the last `n` months (newest first). */
export async function getMonthsSummary(n: number) {
  const months = lastNMonths(n);
  const { start } = monthRange(months[months.length - 1]);
  const { end } = monthRange(months[0]);

  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("order_date, unit_price")
    .gte("order_date", start)
    .lte("order_date", end);
  if (error) throw error;

  const acc: Record<string, { orders: number; total: number }> = {};
  for (const m of months) acc[m] = { orders: 0, total: 0 };

  for (const o of data ?? []) {
    const m = String(o.order_date).slice(0, 7);
    if (acc[m]) {
      acc[m].orders += 1;
      acc[m].total = Math.round((acc[m].total + Number(o.unit_price)) * 100) / 100;
    }
  }

  return months.map((m) => ({ month: m, orders: acc[m].orders, total: acc[m].total }));
}

/** A lookup of user id -> display name, for rendering lists. */
export function nameMap(members: AppUser[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const m of members) map[m.id] = m.full_name || m.email;
  return map;
}
