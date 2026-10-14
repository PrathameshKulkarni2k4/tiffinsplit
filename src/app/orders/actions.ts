"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { splitEqually } from "@/lib/billing";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath("/bills");
  revalidatePath("/vendors");
}

export async function createOrder(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const order_date = String(formData.get("order_date") || "");
  const mess_id = String(formData.get("mess_id") || "");
  const tiffin_type = String(formData.get("tiffin_type") || "");
  const unit_price = Number(formData.get("unit_price"));
  const notes = String(formData.get("notes") || "") || null;
  const sharerIds = formData.getAll("sharers").map((s) => String(s));

  if (!order_date || !mess_id || (tiffin_type !== "full" && tiffin_type !== "half")) {
    throw new Error("Please choose a date, a mess and a portion.");
  }
  if (!Number.isFinite(unit_price) || unit_price < 0) {
    throw new Error("Please enter a valid price.");
  }
  if (sharerIds.length === 0) {
    throw new Error("Select at least one person who shared the tiffin.");
  }

  // Server-side duplicate guard. The form also checks this and disables the
  // button, but that check is advisory - it can be bypassed, and it does not
  // run at all if JavaScript fails. This is the one that holds.
  if (String(formData.get("allow_duplicate") || "") !== "1") {
    const { data: existing, error: dupErr } = await supabase
      .from("orders")
      .select("id")
      .eq("order_date", order_date)
      .eq("mess_id", mess_id)
      .limit(1);
    if (dupErr) throw new Error(dupErr.message);
    if (existing && existing.length > 0) {
      throw new Error(
        'There is already an order for that date and mess. Tick "I know - add it anyway" to log another.',
      );
    }
  }

  const { data: order, error } = await supabase
    .from("orders")
    .insert({ order_date, mess_id, tiffin_type, unit_price, created_by: user.id, notes })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const shares = splitEqually(unit_price, sharerIds).map((s) => ({
    order_id: order.id,
    user_id: s.userId,
    share_amount: s.amount,
  }));

  const { error: shareError } = await supabase.from("order_shares").insert(shares);
  if (shareError) throw new Error(shareError.message);

  revalidateAll();
  redirect("/orders");
}

export async function deleteOrder(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Missing order id.");

  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidateAll();
  // Deleting used to leave no trace on screen at all - the row simply vanished.
  // Now the redirect carries the confirmation back.
  redirect("/orders?deleted=1");
}

/** Undo a whole "Confirm today's lunch" batch. */
export async function undoBatch(formData: FormData) {
  const supabase = createClient();
  const batch = String(formData.get("batch") || "");
  if (!batch) throw new Error("Missing batch id.");

  const { error } = await supabase.from("orders").delete().eq("batch_id", batch);
  if (error) throw new Error(error.message);

  revalidateAll();
  redirect("/orders?undone=1");
}
