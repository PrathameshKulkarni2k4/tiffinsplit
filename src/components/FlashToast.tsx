"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useToast } from "@/components/ui/toast";
import { undoBatch } from "@/app/orders/actions";

/**
 * Turns the flash messages in the URL into toasts.
 *
 * Server actions finish with a redirect, so the result of a write arrives as a
 * query parameter. That is a sound pattern - it survives a refresh and it works
 * without JavaScript - but rendering it as a permanent banner left the message
 * on screen until the next navigation.
 *
 * So: read the parameters, say them once, then strip them from the URL with
 * `replace`, which keeps the history clean. A refresh or a Back press therefore
 * does not replay a message about something that happened minutes ago.
 */
export default function FlashToast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { push, clear } = useToast();

  React.useEffect(() => {
    const logged = params.get("logged");
    const deleted = params.get("deleted");
    const undone = params.get("undone");
    const error = params.get("error");
    if (!logged && !deleted && !undone && !error) return;

    // One flash at a time. Clearing first means an "Undone." message also
    // removes the "Logged 3 tiffins" toast whose Undo no longer applies.
    clear();

    if (logged) {
      const n = Number(logged);
      const batch = params.get("batch");
      push(`Logged ${n} tiffin${n === 1 ? "" : "s"}.`, {
        action: batch ? <UndoButton batch={batch} /> : undefined,
      });
    }
    if (deleted) push("Order deleted.", { variant: "info" });
    if (undone) push("Undone.", { variant: "info" });
    if (error === "auth") {
      push("Could not sign you in. Please try again.", { variant: "error" });
    }

    const next = new URLSearchParams(params);
    for (const key of ["logged", "batch", "deleted", "undone", "error"]) {
      next.delete(key);
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [params, pathname, router, push, clear]);

  return null;
}

/** Undo lives inside the toast, so the escape hatch travels with the message. */
function UndoButton({ batch }: { batch: string }) {
  return (
    <form action={undoBatch}>
      <input type="hidden" name="batch" value={batch} />
      <button
        type="submit"
        className="cursor-pointer rounded-lg border border-input bg-card px-2.5 py-1.5 text-[0.8rem] font-semibold transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        Undo
      </button>
    </form>
  );
}
