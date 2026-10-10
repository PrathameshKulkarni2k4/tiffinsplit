import { cn } from "@/lib/utils";

/**
 * Loading placeholders.
 *
 * One generic skeleton used to serve every route, so the real content landed in
 * a different shape than the placeholder and the page visibly jumped. These are
 * composed per screen instead, at the sizes that screen actually uses, so the
 * swap is quiet.
 *
 * Pulse is an opacity loop, which is the one case where a constant rate is
 * right - it has to read as "still working" rather than as an entrance.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} />;
}

/** Title, subtitle, and a control on the right - the shape every page opens with. */
export function PageHeaderSkeleton({ control = true }: { control?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <Skeleton className="h-[34px] w-[180px]" />
        <Skeleton className="mt-2.5 h-[15px] w-[220px]" />
      </div>
      {control && <Skeleton className="h-11 w-full sm:h-10 sm:w-[160px]" />}
    </div>
  );
}

/** The three summary tiles on the dashboard. */
export function StatRowSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="mb-[18px] grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3.5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card px-[18px] py-4">
          <Skeleton className="h-[11px] w-[80px]" />
          <Skeleton className="mt-2.5 h-[28px] w-[110px]" />
        </div>
      ))}
    </div>
  );
}

/** A stack of cards, each with a name on the left and an amount on the right. */
export function CardListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-[18px]">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card px-5 py-[18px]">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-[18px] w-[140px]" />
            <Skeleton className="h-[18px] w-[76px]" />
          </div>
          <Skeleton className="mt-3 h-[14px] w-[190px]" />
        </div>
      ))}
    </div>
  );
}

/** A table with a header band and body rows. */
export function TableSkeleton({ rows = 7, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex gap-4 border-b px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-[11px] flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 border-b px-4 py-3.5 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={cn("h-[15px] flex-1", c === cols - 1 && "max-w-[80px]")} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** A single wide block - the Today form, or a month of orders in one card. */
export function BlockSkeleton() {
  return <Skeleton className="mb-4 h-[180px] w-full rounded-xl" />;
}
