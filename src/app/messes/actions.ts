"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function revalidateMesses() {
  revalidatePath("/messes");
  revalidatePath("/orders/new");
}

export async function createMess(formData: FormData) {
  const supabase = createClient();
  const name = String(formData.get("name") || "").trim();
  const full_price = Number(formData.get("full_price"));
  const half_price = Number(formData.get("half_price"));

  if (!name) throw new Error("A mess name is required.");
  if (!Number.isFinite(full_price) || !Number.isFinite(half_price)) {
    throw new Error("Enter valid prices.");
  }

  const { error } = await supabase.from("messes").insert({ name, full_price, half_price });
  if (error) throw new Error(error.message);
  revalidateMesses();
}

export async function updateMess(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const full_price = Number(formData.get("full_price"));
  const half_price = Number(formData.get("half_price"));

  if (!id) throw new Error("Missing mess id.");
  if (!name) throw new Error("A mess name is required.");

  const { error } = await supabase
    .from("messes")
    .update({ name, full_price, half_price, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateMesses();
}

export async function toggleMess(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id") || "");
  const is_active = String(formData.get("is_active")) === "true";
  if (!id) throw new Error("Missing mess id.");

  const { error } = await supabase.from("messes").update({ is_active }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateMesses();
}
