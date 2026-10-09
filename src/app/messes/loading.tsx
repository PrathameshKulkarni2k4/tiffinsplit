import { PageHeaderSkeleton, CardListSkeleton, BlockSkeleton } from "@/components/ui/skeleton";

// The add-mess form, then the list.
export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton control={false} />
      <BlockSkeleton />
      <CardListSkeleton rows={3} />
    </>
  );
}
