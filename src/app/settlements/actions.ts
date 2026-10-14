"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/settlements");
  revalidatePath("/bills");
  revalidatePath("/orders");
}

/**
 * Record that one person paid another.
 *
 * The amount comes from the screen, not from the database. That is deliberate:
 * people round, pay a bit now and the rest later, or settle an older month by
 * mistake. Recording what was actually handed over is the honest thing - the
 * app's job is to say what is still outstanding, not to insist the payment
 * matched its own arithmetic.
 */
export async function recordSettlement(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const from = String(formData.get("from_user") || "");
  const to = String(formData.get("to_user") || "");
  const amount = Number(formData.get("amount") || 0);
  const month = String(formData.get("period_month") || "");

  if (!from || !to || from === to) throw new Error("Pick two different people.");
  if (!(amount > 0)) throw new Error("Amount must be more than zero.");
  if (!/^\d{4}-\d{2}$/.test(month)) throw new Error("Missing month.");

  const { error } = await supabase.from("settlements").insert({
    from_user: from,
    to_user: to,
    amount,
    period_month: `${month}-01`,
  });
  if (error) throw new Error(error.message);

  revalidateAll();
  redirect(`/settlements?month=${month}&settled=1`);
}

/** Undo a settlement - the common case being a mis-tap, not a real reversal. */
export async function undoSettlement(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  const month = String(formData.get("period_month") || "");
  if (!id) throw new Error("Missing settlement id.");

  const { error } = await supabase.from("settlements").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidateAll();
  redirect(`/settlements?month=${month}&undone=1`);
}
