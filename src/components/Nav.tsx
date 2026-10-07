import Link from "next/link";
import { getProfile } from "@/lib/auth";
import TabBar from "@/components/TabBar";

// `inline-block py-3` gives each link a full-height tap target on mobile; the
// header's own padding shrinks to compensate, and desktop keeps the tighter bar.
const LINK =
  "inline-block py-3 text-[0.95rem] font-medium text-foreground hover:no-underline md:py-2";
const LINK_DESKTOP = `hidden md:inline-block ${LINK}`;

export default async function Nav() {
  const profile = await getProfile();

  // No navigation until the user has been approved.
  if (!profile || !profile.is_active) return null;

  const isAdmin = profile.role === "admin";

  return (
    <>
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-card px-[18px] py-0.5 md:py-1.5">
        <Link
          href="/"
          className="inline-block py-3 text-[1.1rem] font-bold text-foreground hover:no-underline md:py-2"
        >
          TiffinSplit
        </Link>
        <nav className="flex flex-wrap items-center gap-4">
          <Link href="/orders" className={LINK_DESKTOP}>
            Orders
          </Link>
          <Link href="/bills" className={LINK_DESKTOP}>
            Bills
          </Link>
          <Link href="/vendors" className={LINK_DESKTOP}>
            Messes owed
          </Link>
          <Link href="/messes" className={LINK_DESKTOP}>
            Messes
          </Link>
          {isAdmin && (
            <Link href="/members" className={LINK}>
              Members
            </Link>
          )}
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="cursor-pointer border-0 bg-transparent py-3 font-medium text-muted-foreground hover:text-foreground md:py-2"
            >
              Sign out
            </button>
          </form>
        </nav>
      </header>
      <TabBar />
    </>
  );
}
