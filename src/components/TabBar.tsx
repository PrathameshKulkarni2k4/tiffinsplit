"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarPlus,
  FileText,
  IndianRupee,
  List,
  Store,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const TABS: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/today", label: "Today", Icon: CalendarPlus },
  { href: "/orders", label: "Orders", Icon: List },
  { href: "/bills", label: "Bills", Icon: FileText },
  { href: "/vendors", label: "Owed", Icon: IndianRupee },
  { href: "/messes", label: "Messes", Icon: Store },
];

/** Bottom tab bar, shown on small screens only. */
export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 flex border-t bg-card px-1.5 pt-1 md:hidden"
      style={{ paddingBottom: "calc(4px + env(safe-area-inset-bottom, 0px))" }}
    >
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-[54px] flex-1 flex-col items-center justify-center gap-[3px] rounded-xl px-0.5 py-1.5 text-[0.7rem] font-semibold leading-none hover:no-underline",
              active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            )}
          >
            <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
