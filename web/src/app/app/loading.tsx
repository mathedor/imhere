import { CardSkeleton, Skeleton } from "@/components/Skeleton";

export default function AppLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-6 md:px-8">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-48 rounded-full" />
        <Skeleton className="h-10 w-72 rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-pill" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-11 w-28 rounded-pill" />
        <Skeleton className="h-11 w-28 rounded-pill" />
        <Skeleton className="h-11 w-28 rounded-pill" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
