import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <TableSkeleton rows={5} cols={3} />
    </>
  );
}
