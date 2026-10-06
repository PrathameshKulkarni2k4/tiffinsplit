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
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-card px-[18px] py-3">
        <Link href="/" className="text-[1.1rem] font-bold text-foreground hover:no-underline">
          TiffinSplit
        </Link>
        <nav className="flex flex-wrap items-center gap-4">
          <Link
            href="/orders"
            className="hidden text-[0.95rem] font-medium text-foreground hover:no-underline md:inline"
          >
            Orders
          </Link>
          <Link
            href="/bills"
            className="hidden text-[0.95rem] font-medium text-foreground hover:no-underline md:inline"
          >
            Bills
          </Link>
          <Link
            href="/vendors"
            className="hidden text-[0.95rem] font-medium text-foreground hover:no-underline md:inline"
          >
            Messes owed
          </Link>
          <Link
            href="/messes"
            className="hidden text-[0.95rem] font-medium text-foreground hover:no-underline md:inline"
          >
            Messes
          </Link>
          {isAdmin && (
            <Link
              href="/members"
              className="text-[0.95rem] font-medium text-foreground hover:no-underline"
            >
              Members
            </Link>
          )}
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="cursor-pointer border-0 bg-transparent p-0 font-medium text-muted-foreground hover:text-foreground"
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
