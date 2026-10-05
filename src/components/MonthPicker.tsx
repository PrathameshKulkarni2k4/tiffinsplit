"use client";

import { usePathname, useRouter } from "next/navigation";

/** A month switcher. Changing it navigates to ?month=YYYY-MM on the current page. */
export default function MonthPicker({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <label className="monthpicker">
      Month
      <input
        type="month"
        value={month}
        onChange={(e) => {
          const value = e.target.value;
          router.push(value ? `${pathname}?month=${value}` : pathname);
        }}
      />
    </label>
  );
}
