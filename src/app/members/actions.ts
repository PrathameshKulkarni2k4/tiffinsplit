"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Only an active admin may manage members. */
async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You are not signed in.");

  const { data: me } = await supabase.from("users").select("role, is_active").eq("id", user.id).single();
  if (!me || me.role !== "admin" || !me.is_active) {
    throw new Error("Only an admin can manage members.");
  }
  return supabase;
}

export async function setActive(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") || "");
  const is_active = String(formData.get("is_active")) === "true";
  if (!id) throw new Error("Missing member id.");

  const { error } = await supabase.from("users").update({ is_active }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/members");
}

export async function setRole(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") || "");
  const role = String(formData.get("role") || "");
  if (role !== "member" && role !== "admin") throw new Error("Invalid role.");

  const { error } = await supabase.from("users").update({ role }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/members");
}
