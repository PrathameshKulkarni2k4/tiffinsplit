import { PageHeaderSkeleton, StatRowSkeleton, TableSkeleton } from "@/components/ui/skeleton";

// Matches the dashboard: header, three stat tiles, then the two tables.
// The previous version was one generic shape reused on every route, so the real
// content landed in a different layout than the placeholder and the page jumped.
export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <StatRowSkeleton count={3} />
      <TableSkeleton rows={6} cols={2} />
      <div className="h-4" />
      <TableSkeleton rows={5} cols={3} />
    </>
  );
}
