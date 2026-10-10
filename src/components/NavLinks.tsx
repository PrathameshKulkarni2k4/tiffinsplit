"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

/**
 * The desktop header links.
 *
 * This is a client component purely so it can ask where it is. The header
 * itself stays a server component - it reads the profile - and hands the one
 * fact these links need (`isAdmin`) down as a prop.
 *
 * The active link is tinted and carries `aria-current`, which is the part
 * that matters: sighted users get the highlight, and a screen reader announces
 * "current page" instead of reading five identical links.
 */
const ITEM =
  "inline-block rounded-lg px-2.5 py-2 text-[0.95rem] font-medium transition-colors hover:no-underline";

export default function NavLinks({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const items = [
    { href: "/orders", label: "Orders", desktopOnly: true },
    { href: "/bills", label: "Bills", desktopOnly: true },
    { href: "/vendors", label: "Messes owed", desktopOnly: true },
    { href: "/messes", label: "Messes", desktopOnly: true },
    // Not in the bottom tab bar, so it stays reachable on a phone.
    ...(isAdmin ? [{ href: "/members", label: "Members", desktopOnly: false }] : []),
  ];

  return (
    <nav className="flex flex-wrap items-center gap-0.5">
      {items.map(({ href, label, desktopOnly }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              ITEM,
              desktopOnly && "hidden md:inline-block",
              active
                ? "bg-accent text-accent-foreground"
                : "text-foreground hover:bg-accent/60 hover:text-accent-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
