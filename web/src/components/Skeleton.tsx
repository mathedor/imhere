import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-surface-2", className)} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-card border border-border bg-surface p-0">
      <Skeleton className="h-44 w-full rounded-card rounded-b-none" />
      <div className="flex items-center gap-3 p-4">
        <div className="flex -space-x-2">
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="size-7 rounded-full" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="mt-1.5 h-2 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
      <Skeleton className="size-12 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-3 w-32 rounded-full" />
        <Skeleton className="mt-2 h-2.5 w-24 rounded-full" />
      </div>
      <Skeleton className="h-6 w-12 rounded-full" />
    </div>
  );
}

export function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <Skeleton className="size-9 rounded-xl" />
      <Skeleton className="mt-3 h-2.5 w-16 rounded-full" />
      <Skeleton className="mt-2 h-7 w-20 rounded-full" />
    </div>
  );
}
