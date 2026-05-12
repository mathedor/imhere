import { ListItemSkeleton, Skeleton } from "@/components/Skeleton";

export default function ChatLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-6">
      <Skeleton className="mb-2 h-8 w-40 rounded-2xl" />
      <Skeleton className="mb-5 h-3 w-56 rounded-full" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <ListItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
