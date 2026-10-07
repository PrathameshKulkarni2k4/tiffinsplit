"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Route-level error boundary. Without this, a failed query dropped the user on
 * Next's unstyled default error page.
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
    <Card className="mx-auto mt-20 max-w-[420px] px-6 py-6 text-center">
      <h1 className="text-2xl font-semibold leading-none tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        That page didn&apos;t load. Try again — if it keeps happening, tell whoever looks after the
        app.
      </p>
      <Button className="mt-4 w-full" onClick={reset}>
        Try again
      </Button>
    </Card>
  );
}
