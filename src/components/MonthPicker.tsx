"use client";

import { usePathname, useRouter } from "next/navigation";

import { Label } from "@/components/ui/label";

/** A month switcher. Changing it navigates to ?month=YYYY-MM on the current page. */
export default function MonthPicker({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Label className="flex w-full items-center justify-between gap-2 text-sm font-semibold text-muted-foreground sm:w-auto sm:justify-start">
      Month
      <input
        type="month"
        value={month}
        onChange={(e) => {
          const value = e.target.value;
          router.push(value ? `${pathname}?month=${value}` : pathname);
        }}
        className="flex-1 rounded-md border border-input bg-transparent px-2.5 py-[7px] text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-none"
      />
    </Label>
  );
}
