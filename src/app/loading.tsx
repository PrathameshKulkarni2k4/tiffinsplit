export default function Loading() {
  return (
    <div className="pt-1.5">
      <div className="mb-2.5 h-[30px] w-[45%] animate-pulse rounded-xl bg-muted" />
      <div className="mb-5 h-[15px] w-[30%] animate-pulse rounded-xl bg-muted" />
      <div className="mb-[18px] grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3.5">
        <div className="h-[78px] animate-pulse rounded-xl bg-muted" />
        <div className="h-[78px] animate-pulse rounded-xl bg-muted" />
        <div className="h-[78px] animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="mb-4 h-[140px] animate-pulse rounded-xl bg-muted" />
      <div className="mb-4 h-[140px] animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
