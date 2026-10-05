import Link from "next/link";
import { getProfile } from "@/lib/auth";
import TabBar from "@/components/TabBar";

export default async function Nav() {
  const profile = await getProfile();

  // No navigation until the user has been approved.
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
