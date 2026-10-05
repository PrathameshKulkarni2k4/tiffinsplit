"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { splitEqually } from "@/lib/billing";
import { planGroup, type SplitMode } from "@/lib/split";

type Payload = {
  date: string;
  allowDuplicate?: boolean;
  groups: { messId: string; mode: SplitMode; present: string[]; oddUser: string | null }[];
};

export async function logToday(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  let payload: Payload;
  try {
    payload = JSON.parse(String(formData.get("payload") || "{}"));
  } catch {
    throw new Error("Could not read the form.");
  }

  const groups = (payload.groups ?? []).filter((g) => (g.present ?? []).length > 0);
  if (groups.length === 0) throw new Error("Pick at least one person who's eating.");

  // one person, one mess
  const seen = new Set<string>();
  for (const g of groups) {
    for (const uid of g.present) {
      if (seen.has(uid)) throw new Error("A person can only be in one mess group.");
      seen.add(uid);
    }
  }

  const supabase = createClient();
  const messIds = groups.map((g) => g.messId);

  // Guard against logging the same day twice by accident.
  if (!payload.allowDuplicate) {
    const { data: existing, error: dupErr } = await supabase
      .from("orders")
      .select("id")
      .eq("order_date", payload.date)
      .in("mess_id", messIds)
      .limit(1);
    if (dupErr) throw new Error(dupErr.message);
    if (existing && existing.length > 0) {
      throw new Error('There are already orders for that date and mess. Tick "Add anyway" to log them again.');
    }
  }

  const { data: messRows, error: messErr } = await supabase
    .from("messes")
    .select("id, full_price, half_price")
    .in("id", messIds);
  if (messErr) throw new Error(messErr.message);

  const priceById: Record<string, { full: number; half: number }> = {};
  for (const m of messRows ?? []) {
    priceById[m.id] = { full: Number(m.full_price), half: Number(m.half_price) };
  }

  const batchId = crypto.randomUUID();
  const orderRows: Record<string, unknown>[] = [];
  const shareRows: Record<string, unknown>[] = [];

  for (const g of groups) {
    const price = priceById[g.messId];
    if (!price) throw new Error("That mess no longer exists.");

    const plan = planGroup(g.present, price.full, price.half, g.mode, g.oddUser);
    if (plan.needsHalfPick) throw new Error("Choose who is taking the half.");

    for (const o of plan.orders) {
      const orderId = crypto.randomUUID();
      orderRows.push({
        id: orderId,
        order_date: payload.date,
        mess_id: g.messId,
        tiffin_type: o.tiffin_type,
        unit_price: o.unit_price,
        created_by: user.id,
        batch_id: batchId,
      });
      for (const s of splitEqually(o.unit_price, o.sharers)) {
        shareRows.push({ order_id: orderId, user_id: s.userId, share_amount: s.amount });
      }
    }
  }

  const { error: orderErr } = await supabase.from("orders").insert(orderRows);
  if (orderErr) throw new Error(orderErr.message);

  const { error: shareErr } = await supabase.from("order_shares").insert(shareRows);
  if (shareErr) throw new Error(shareErr.message);

  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath("/bills");
  revalidatePath("/vendors");

  redirect(`/orders?logged=${orderRows.length}&batch=${batchId}`);
}
