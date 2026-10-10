import { PageHeaderSkeleton, BlockSkeleton } from "@/components/ui/skeleton";

// Matches the Today screen: a header, then one mess card with chips and a
// split control, then the confirm button.
export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <BlockSkeleton />
      <BlockSkeleton />
    </>
  );
}
