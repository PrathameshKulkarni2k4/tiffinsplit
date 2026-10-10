"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A picker surface: a bottom sheet on a phone, a centred dialog on desktop.
 *
 * Not a floating popup anchored to the trigger. On touch, an anchored popup is
 * either too small to hit or drifts off-screen near the keyboard; a sheet that
 * comes up from the bottom is where the thumb already is, and it is the pattern
 * every phone app uses for exactly this. Desktop keeps the centred dialog,
 * which is the equivalent convention with a pointer.
 *
 * Escape closes it, the page behind stops scrolling while it is open, and focus
 * moves into the panel on open. The caller returns focus to its trigger.
 */
export default function Sheet({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const panel = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);

    // Stop the page scrolling behind the sheet. Without this, a drag inside the
    // sheet on iOS scrolls the page underneath instead.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* A warm scrim rather than pure black, so it belongs to the palette in
          both themes instead of reading as a grey wash. */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default border-0 bg-[#1a1512]/45 p-0"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "sheet-in relative w-full max-w-[420px] rounded-t-2xl border bg-card p-5 outline-none",
          "pb-[calc(20px+env(safe-area-inset-bottom,0px))] shadow-lift sm:rounded-2xl sm:pb-5",
          className,
        )}
      >
        {/* Grab handle, mobile only. It signals the sheet can be dismissed
            downward, which is what people try. */}
        <span className="mx-auto mb-3 block h-1 w-9 rounded-full bg-border sm:hidden" aria-hidden="true" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[1.05rem] font-semibold tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 grid h-9 w-9 cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
