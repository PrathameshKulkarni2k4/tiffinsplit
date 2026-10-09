import Link from "next/link";

import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * Shown for a URL that doesn't match a page, and for `notFound()` calls such as
 * a person id that no longer exists.
 */
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[78vh] max-w-[400px] flex-col justify-center px-1">
      <div className="mb-6 flex items-start justify-between">
        <span className="fig text-[0.85rem] font-semibold tracking-widest text-muted-foreground">
          404
        </span>
        <ThemeToggle />
      </div>

      <h1 className="text-[2rem] font-semibold leading-[1.1] tracking-tight">
        That page isn&apos;t here
      </h1>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">
        The link may point at a month or a person that isn&apos;t there any more — or it may just
        be a typo.
      </p>

      <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/">Back to the dashboard</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link href="/today">Log a tiffin</Link>
        </Button>
      </div>
    </div>
  );
}
