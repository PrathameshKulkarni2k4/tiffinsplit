"use client";

import { usePathname, useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";

/**
 * A month switcher. Changing it navigates to ?month=YYYY-MM on the current page.
 *
 * The label sits inside the same bordered box as the input rather than beside
 * it. Beside it, the small word "Month" and the taller input could only be
 * centred against each other by eye, and they never quite were - the label
 * floated a few pixels low. Inside the box there is one baseline to align to,
 * and the icon carries the meaning the word used to.
 */
export default function MonthPicker({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <label className="flex w-full cursor-pointer items-center gap-2 rounded-md border border-input bg-card px-3 shadow-card transition-colors focus-within:ring-2 focus-within:ring-ring sm:w-auto">
      <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="sr-only">Month</span>
      <input
        type="month"
        value={month}
        onChange={(e) => {
          const value = e.target.value;
          router.push(value ? `${pathname}?month=${value}` : pathname);
        }}
        className="min-h-[44px] w-full flex-1 border-0 bg-transparent py-2 text-sm font-medium text-foreground focus-visible:outline-none sm:min-h-0 sm:w-auto"
      />
    </label>
  );
}
