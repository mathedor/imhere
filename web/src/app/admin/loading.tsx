import { KpiSkeleton, Skeleton } from "@/components/Skeleton";

export default function AdminLoading() {
  return (
    <>
      <div className="mb-6">
        <Skeleton className="h-8 w-72 rounded-2xl" />
        <Skeleton className="mt-2 h-3 w-96 rounded-full" />
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </>
  );
}
