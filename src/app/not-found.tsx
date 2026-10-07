import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Shown for a URL that doesn't match a page, and for `notFound()` calls such as
 * a person id that no longer exists.
 */
export default function NotFound() {
  return (
    <Card className="mx-auto mt-20 max-w-[420px] px-6 py-6 text-center">
      <h1 className="text-2xl font-semibold leading-none tracking-tight">Page not found</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        That link doesn&apos;t go anywhere. It may point at a month or a person that isn&apos;t
        there any more.
      </p>
      <Button asChild className="mt-4 w-full">
        <Link href="/">Back to the dashboard</Link>
      </Button>
    </Card>
  );
}
