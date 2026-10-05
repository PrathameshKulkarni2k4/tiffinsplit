import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { AppUser } from "@/lib/types";

/**
 * These helpers are memoised with React `cache`, so a single request that
 * touches them from the layout *and* the page only performs one round trip
 * to Supabase instead of several.
 */

/** The signed-in auth user for this request. */
export const getSessionUser = cache(async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** The signed-in user's profile row (role, active flag, name). */
export const getProfile = cache(async (): Promise<AppUser | null> => {
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = createClient();
  const { data } = await supabase
    .from("users")
    .select("id, email, full_name, avatar_url, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  return (data as AppUser) ?? null;
});
