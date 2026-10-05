"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Home" },
  { href: "/orders", label: "Orders" },
  { href: "/bills", label: "Bills" },
  { href: "/vendors", label: "Owed" },
  { href: "/messes", label: "Messes" },
];

/** Bottom tab bar, shown on small screens only (see globals.css). */
export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="tabbar">
      {TABS.map((t) => {
        const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={`tab${active ? " active" : ""}`}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
