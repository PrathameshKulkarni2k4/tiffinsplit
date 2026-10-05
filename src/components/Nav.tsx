import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TabBar from "@/components/TabBar";

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

  const isAdmin = profile.role === "admin";

  return (
    <>
      <header className="topbar">
        <Link href="/" className="brand">
          TiffinSplit
        </Link>
        <nav className="topbar-nav">
          <Link href="/orders" className="desktop-only">
            Orders
          </Link>
          <Link href="/bills" className="desktop-only">
            Bills
          </Link>
          <Link href="/vendors" className="desktop-only">
            Messes owed
          </Link>
          <Link href="/messes" className="desktop-only">
            Messes
          </Link>
          {isAdmin && <Link href="/members">Members</Link>}
          <form action="/auth/signout" method="post">
            <button type="submit" className="link-btn">
              Sign out
            </button>
          </form>
        </nav>
      </header>
      <TabBar />
    </>
  );
}
