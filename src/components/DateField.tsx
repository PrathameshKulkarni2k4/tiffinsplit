"use client";

import * as React from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import Sheet from "@/components/ui/sheet";
import { prettyDate, todayISO } from "@/lib/format";
import { cn } from "@/lib/utils";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
// Sunday first, which is the convention on Indian calendars.
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function iso(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function shiftMonth(monthKey: string, by: number): string {
  const [y, m] = monthKey.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function yesterdayISO(): string {
  const d = new Date(todayISO() + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * A date field.
 *
 * Replaces `<input type="date">`, which on a phone opens the OS's own control -
 * a spinner on some browsers, a full-screen calendar on others, styled by
 * nobody in this app. It also silently renders differently in every browser,
 * which is why a date field can look right on a laptop and wrong on the phone
 * the app is actually used from.
 *
 * The sheet opens on the month of the current value, marks today, and puts
 * Today and Yesterday one tap away - for this app the answer is almost always
 * one of those two, and making someone navigate a calendar to say "today" is
 * the kind of friction that adds up over a hundred entries.
 */
export default function DateField({
  value,
  onChange,
  name,
  label = "Date",
  defaultOpen = false,
}: {
  value: string;
  onChange: (value: string) => void;
  /** When set, a hidden input carries the value into a plain form submit. */
  name?: string;
  label?: string;
  /** Harness only: render with the sheet already open, so it can be seen. */
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [view, setView] = React.useState(() => value.slice(0, 7));
  const trigger = React.useRef<HTMLButtonElement>(null);

  function pick(next: string) {
    setOpen(false);
    trigger.current?.focus();
    onChange(next);
  }

  function close() {
    setOpen(false);
    trigger.current?.focus();
  }

  const [vy, vm] = view.split("-").map(Number);
  const firstWeekday = new Date(Date.UTC(vy, vm - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(vy, vm, 0)).getUTCDate();
  const today = todayISO();

  // Leading blanks so the 1st lands under the right weekday.
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => {
          setView(value.slice(0, 7));
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex min-h-[46px] w-full cursor-pointer items-center gap-2 rounded-md border border-input bg-card px-3 text-left text-base font-medium shadow-card transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        {prettyDate(value)}
        <span className="ml-auto text-[0.8rem] font-normal text-muted-foreground">
          {value === today ? "today" : ""}
        </span>
      </button>

      {/* Carries the value into the surrounding form. The visible control is a
          button, so without this the form would submit nothing. */}
      {name && <input type="hidden" name={name} value={value} />}

      <Sheet open={open} onClose={close} title={label}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setView((v) => shiftMonth(v, -1))}
            aria-label="Previous month"
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-lg border border-input bg-card transition-colors hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="text-[1.05rem] font-semibold tracking-tight">
            {MONTHS[vm - 1]} {vy}
          </span>
          <button
            type="button"
            onClick={() => setView((v) => shiftMonth(v, 1))}
            aria-label="Next month"
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-lg border border-input bg-card transition-colors hover:bg-accent"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((w, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="grid h-8 place-items-center text-[0.7rem] font-semibold uppercase tracking-[0.06em] text-foreground/75"
            >
              {w}
            </span>
          ))}
          {cells.map((day, i) =>
            day === null ? (
              <span key={`b${i}`} aria-hidden="true" />
            ) : (
              <button
                key={day}
                type="button"
                onClick={() => pick(iso(vy, vm - 1, day))}
                aria-current={iso(vy, vm - 1, day) === today ? "date" : undefined}
                className={cn(
                  "fig grid h-11 cursor-pointer place-items-center rounded-lg text-[0.9rem] font-medium transition-colors",
                  iso(vy, vm - 1, day) === value
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground",
                  // Today is marked with a ring, never with the selected fill -
                  // otherwise "today" and "chosen" would look the same.
                  iso(vy, vm - 1, day) === today &&
                    iso(vy, vm - 1, day) !== value &&
                    "ring-1 ring-inset ring-primary/60 font-semibold text-primary",
                )}
              >
                {day}
              </button>
            ),
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => pick(today)}
            className="min-h-[44px] flex-1 cursor-pointer rounded-lg border border-input bg-card text-sm font-medium transition-colors hover:bg-accent"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => pick(yesterdayISO())}
            className="min-h-[44px] flex-1 cursor-pointer rounded-lg border border-input bg-card text-sm font-medium transition-colors hover:bg-accent"
          >
            Yesterday
          </button>
        </div>
      </Sheet>
    </>
  );
}
