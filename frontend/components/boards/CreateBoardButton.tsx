"use client";

import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateBoard } from "@/features/boards/use-boards";
import { cn } from "@/lib/utils";

/** Creates an untitled board and opens it. Shared by every "New board" entry
 * point (sidebar, empty state, grid tile) so they behave identically. */
export function useCreateAndOpenBoard() {
  const router = useRouter();
  const { mutate, isPending } = useCreateBoard();
  function create() {
    if (isPending) return;
    mutate("Untitled board", {
      onSuccess: (board) => router.push(`/boards/${board.id}`),
    });
  }
  return { create, isPending };
}

export function CreateBoardButton({ className }: { className?: string }) {
  const { create, isPending } = useCreateAndOpenBoard();
  return (
    <Button onClick={create} disabled={isPending} className={className}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      New board
    </Button>
  );
}

/** Blank-canvas tile that sits first in the grid. */
export function NewBoardTile() {
  const { create, isPending } = useCreateAndOpenBoard();
  return (
    <button
      onClick={create}
      disabled={isPending}
      className={cn(
        "group flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-dots text-muted-foreground transition-colors",
        "hover:border-foreground/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl border bg-card text-foreground shadow-sm transition-transform group-hover:scale-105">
        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
      </span>
      <span className="text-sm font-medium">Blank board</span>
    </button>
  );
}
