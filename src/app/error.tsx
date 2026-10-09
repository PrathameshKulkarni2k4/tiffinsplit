"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary. Without this, a failed query dropped the user on
 * Next's unstyled default error page.
 *
 * The copy leads with recovery, not with the fault: what happened, then what to
 * do. The technical detail stays in the console rather than on the screen - the
 * people using this are flatmates, not operators.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[78vh] max-w-[400px] flex-col justify-center px-1">
      <span className="mb-6 grid h-11 w-11 place-items-center rounded-full bg-destructive/12 text-destructive">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M12 8v5m0 3.5h.01M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <h1 className="text-[2rem] font-semibold leading-[1.1] tracking-tight">
        That didn&apos;t load
      </h1>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">
        Something went wrong on our side. Trying again usually works — nothing you logged has been
        lost.
      </p>

      <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
        <Button size="lg" className="w-full sm:w-auto" onClick={reset}>
          Try again
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <a href="/">Back to the dashboard</a>
        </Button>
      </div>

      {error.digest && (
        <p className="mt-5 text-[0.75rem] text-muted-foreground">
          Reference <span className="fig">{error.digest}</span> — worth quoting if you report it.
        </p>
      )}
    </div>
  );
}
