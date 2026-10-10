"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import Sheet from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const SHORT = MONTHS.map((m) => m.slice(0, 3));

function thisMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(month: string, by: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function pretty(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/**
 * A month switcher.
 *
 * This used to be `<input type="month">`. On a phone that hands the job to the
 * operating system, which draws its own control - different on iOS, different
 * on Android, neither matching this app - and on some mobile browsers it is a
 * spinner you scroll through months one at a time, which is slow and, for
 * anyone with hand trouble, painful.
 *
 * So: a button that opens a sheet with the year, a grid of the twelve months,
 * and two presets. One tap for the common case, two for any other month in the
 * year, and the arrows for a different year. Every target clears 44px.
 *
 * The value is shown as a word, not as `2026-10`, because that is what a person
 * reads. The ISO form stays in the URL where it belongs.
 */
export default function MonthPicker({
  month,
  defaultOpen = false,
}: {
  month: string;
  /** Harness only: render with the sheet already open, so it can be seen. */
  defaultOpen?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(defaultOpen);
  const [year, setYear] = React.useState(() => Number(month.slice(0, 4)));
  const trigger = React.useRef<HTMLButtonElement>(null);

  function choose(value: string) {
    setOpen(false);
    trigger.current?.focus();
    router.push(`${pathname}?month=${value}`);
  }

  function close() {
    setOpen(false);
    trigger.current?.focus();
  }

  const y = Number(month.slice(0, 4));

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => {
          setYear(y);
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex min-h-[44px] w-full cursor-pointer items-center gap-2 rounded-md border border-input bg-card px-3 text-sm font-medium shadow-card transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground sm:w-auto"
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        {pretty(month)}
        <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground sm:ml-0" aria-hidden="true" />
      </button>

      <Sheet open={open} onClose={close} title="Jump to a month">
        <div className="mb-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setYear((v) => v - 1)}
            aria-label="Previous year"
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-lg border border-input bg-card transition-colors hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="fig text-[1.05rem] font-semibold">{year}</span>
          <button
            type="button"
            onClick={() => setYear((v) => v + 1)}
            aria-label="Next year"
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-lg border border-input bg-card transition-colors hover:bg-accent"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {SHORT.map((label, i) => {
            const value = `${year}-${String(i + 1).padStart(2, "0")}`;
            const isSelected = value === month;
            const isNow = value === thisMonth();
            return (
              <button
                key={label}
                type="button"
                onClick={() => choose(value)}
                aria-current={isSelected ? "true" : undefined}
                className={cn(
                  "min-h-[48px] cursor-pointer rounded-lg border text-sm font-semibold transition-colors",
                  isSelected
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-border bg-card hover:bg-accent hover:text-accent-foreground",
                  // "Now" gets a marker that is not the selected treatment, so
                  // the two states never read as the same thing.
                  isNow && !isSelected && "border-primary/50",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => choose(thisMonth())}
            className="min-h-[44px] flex-1 cursor-pointer rounded-lg border border-input bg-card text-sm font-medium transition-colors hover:bg-accent"
          >
            This month
          </button>
          <button
            type="button"
            onClick={() => choose(shiftMonth(thisMonth(), -1))}
            className="min-h-[44px] flex-1 cursor-pointer rounded-lg border border-input bg-card text-sm font-medium transition-colors hover:bg-accent"
          >
            Last month
          </button>
        </div>
      </Sheet>
    </>
  );
}
