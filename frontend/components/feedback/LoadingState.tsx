import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const GRID = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4";

/** Mirrors BoardCard: thumbnail, title line, meta line. Keep in sync so the
 * page doesn't jump when real data arrives. */
export function BoardCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <Skeleton className="aspect-[16/11] w-full rounded-none" />
      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-6 w-6 rounded-md" />
      </div>
    </div>
  );
}

export function BoardGridSkeleton({ view = "grid", count = 8 }: { view?: "grid" | "list"; count?: number }) {
  if (view === "list") {
    return (
      <div className="divide-y overflow-hidden rounded-2xl border bg-card">
        {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-11 w-14 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48 max-w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="hidden h-3 w-20 sm:block" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className={GRID}>
      {Array.from({ length: count }).map((_, i) => (
        <BoardCardSkeleton key={i} />
      ))}
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <aside className="hidden w-[264px] shrink-0 flex-col gap-6 border-r bg-sidebar p-4 md:flex">
      <div className="flex items-center gap-2.5 px-1">
        <Skeleton className="h-8 w-8 rounded-[10px]" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-9 w-full rounded-lg" />
        ))}
      </div>
      <div className="mt-auto flex items-center gap-3 px-1">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </aside>
  );
}

/** Whole dashboard shell (sidebar, top bar, page header, grid). */
export function DashboardSkeleton() {
  return (
    <div className="flex h-dvh overflow-hidden" role="status" aria-label="Loading your boards">
      <SidebarSkeleton />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-16 items-center gap-4 border-b px-4 sm:px-8">
          <Skeleton className="h-10 w-full max-w-md rounded-lg" />
          <Skeleton className="ml-auto h-9 w-9 rounded-lg" />
        </div>
        <div className="flex-1 overflow-hidden px-4 py-8 sm:px-8">
          <div className="mb-8 space-y-3">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <BoardGridSkeleton />
        </div>
      </div>
    </div>
  );
}

/** Settings page body, used while the session is resolving. */
export function SettingsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-10 px-4 py-10 sm:px-8" role="status" aria-label="Loading settings">
      <div className="space-y-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="grid gap-6 border-t pt-8 md:grid-cols-[220px_1fr]">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Editor shell: header, floating toolbar, dotted canvas, zoom pill. */
export function EditorSkeleton() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden" role="status" aria-label="Opening board">
      <div className="flex h-14 items-center justify-between gap-4 border-b bg-card px-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>
      <div className="relative flex-1 bg-dots">
        <Skeleton className="absolute left-1/2 top-4 h-12 w-72 -translate-x-1/2 rounded-xl sm:bottom-6 sm:left-4 sm:top-auto sm:translate-x-0" />
        <Skeleton className="absolute bottom-6 right-4 hidden h-10 w-32 rounded-xl sm:block" />
      </div>
    </div>
  );
}

export function FullPageLoading({ className }: { className?: string }) {
  return (
    <div className={cn("flex min-h-screen items-center justify-center", className)} role="status" aria-label="Loading">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
