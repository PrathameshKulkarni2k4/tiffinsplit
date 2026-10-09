import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The state a screen is in before anyone has done anything.
 *
 * An empty screen is the first thing a new member sees, so it carries more
 * weight than its size suggests. It says what is missing, why it will fill in,
 * and what to do next - in that order. A bare "No orders" line does none of
 * those and reads as a broken page rather than a new one.
 */
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border border-dashed border-input bg-card/60 px-6 py-10 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="mb-3.5 grid h-11 w-11 place-items-center rounded-full bg-accent text-accent-foreground">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      )}
      <p className="text-[0.95rem] font-semibold tracking-tight">{title}</p>
      {body && (
        <p className="mt-1 max-w-[38ch] text-sm leading-relaxed text-muted-foreground">
          {body}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
