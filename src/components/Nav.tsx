import Link from "next/link";
import { getProfile } from "@/lib/auth";
import TabBar from "@/components/TabBar";
import NavLinks from "@/components/NavLinks";
import ThemeToggle from "@/components/ThemeToggle";

export default async function Nav() {
  const profile = await getProfile();

  // No navigation until the user has been approved.
  if (!profile || !profile.is_active) return null;

  const isAdmin = profile.role === "admin";

  return (
    <>
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-card px-[18px] py-1.5">
        <Link
          href="/"
          className="inline-block py-2 text-[1.1rem] font-bold tracking-tight text-foreground hover:no-underline"
        >
          TiffinSplit
        </Link>
        <div className="flex items-center gap-1">
          <NavLinks isAdmin={isAdmin} />
          <ThemeToggle />
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="inline-block cursor-pointer rounded-lg border-0 bg-transparent px-2.5 py-2 font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <TabBar />
    </>
  );
}
