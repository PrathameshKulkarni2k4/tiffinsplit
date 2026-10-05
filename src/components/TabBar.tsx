"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Icon({ name }: { name: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "today":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
    case "orders":
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
    case "bills":
      return (
        <svg {...common}>
          <path d="M6 3h8l4 4v14H6z" />
          <path d="M14 3v4h4" />
          <path d="M9 12h6M9 16h6" />
        </svg>
      );
    case "owed":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5v9M9.5 10h5M9.5 14h5" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M4 9.5h16V20H4z" />
          <path d="M4 9.5 6 4h12l2 5.5" />
        </svg>
      );
  }
}

const TABS = [
  { href: "/today", label: "Today", icon: "today" },
  { href: "/orders", label: "Orders", icon: "orders" },
  { href: "/bills", label: "Bills", icon: "bills" },
  { href: "/vendors", label: "Owed", icon: "owed" },
  { href: "/messes", label: "Messes", icon: "messes" },
];

/** Bottom tab bar, shown on small screens only (see globals.css). */
export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((t) => {
        const active = pathname === t.href || pathname.startsWith(t.href + "/");
        return (
          <Link key={t.href} href={t.href} className={`tab${active ? " active" : ""}`}>
            <Icon name={t.icon} />
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
