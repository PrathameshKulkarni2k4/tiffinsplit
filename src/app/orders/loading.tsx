import { PageHeaderSkeleton, TableSkeleton, CardListSkeleton } from "@/components/ui/skeleton";

// Table on desktop, cards on a phone - the same split the real page makes.
export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <div className="mb-5 h-11 w-full rounded-md bg-muted sm:max-w-[320px]" />
      <div className="hidden md:block">
        <TableSkeleton rows={7} cols={5} />
      </div>
      <div className="md:hidden">
        <CardListSkeleton rows={4} />
      </div>
    </>
  );
}
