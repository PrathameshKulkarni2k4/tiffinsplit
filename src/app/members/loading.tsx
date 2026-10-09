import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton control={false} />
      <TableSkeleton rows={6} cols={4} />
    </>
  );
}
