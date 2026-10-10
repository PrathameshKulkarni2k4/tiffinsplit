import { PageHeaderSkeleton, CardListSkeleton } from "@/components/ui/skeleton";

// A row of share buttons, then one card per person.
export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <div className="mb-5 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-9 w-[104px] animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <CardListSkeleton rows={6} />
    </>
  );
}
