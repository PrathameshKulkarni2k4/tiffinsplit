import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Nav() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // No navigation until the user has been approved.
  const { data: profile } = await supabase
    .from("users")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) return null;

  return (
    <header className="nav">
      <Link href="/" className="brand">
        TiffinSplit
      </Link>
      <nav className="nav-links">
        <Link href="/">Dashboard</Link>
        <Link href="/orders">Orders</Link>
        <Link href="/bills">Bills</Link>
        <Link href="/vendors">Messes owed</Link>
        <Link href="/messes">Messes</Link>
        {profile.role === "admin" && <Link href="/members">Members</Link>}
        <form action="/auth/signout" method="post">
          <button type="submit" className="link-btn">
            Sign out
          </button>
        </form>
      </nav>
    </header>
  );
}
