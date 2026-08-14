"use client";

import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { BoardGrid } from "@/components/boards/BoardGrid";
import { CreateBoardButton } from "@/components/boards/CreateBoardButton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { BoardGridSkeleton } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useBoards, useDeleteBoard, useDuplicateBoard, useRenameBoard } from "@/features/boards/use-boards";
import { LayoutGrid } from "lucide-react";

export default function DashboardPage() {
  const { data: boards, isLoading, isError, refetch } = useBoards();
  const deleteBoard = useDeleteBoard();
  const duplicateBoard = useDuplicateBoard();
  const renameBoard = useRenameBoard();
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => (boards ?? []).filter((b) => b.name.toLowerCase().includes(query.toLowerCase())),
    [boards, query]
  );

  function handleRename(boardId: string) {
    const current = boards?.find((b) => b.id === boardId);
    const name = window.prompt("Rename board", current?.name);
    if (name && name.trim()) renameBoard.mutate({ boardId, name: name.trim() });
  }

  function handleDelete(boardId: string) {
    if (window.confirm("Delete this board? This can't be undone.")) {
      deleteBoard.mutate(boardId);
    }
  }

  return (
    <DashboardLayout>
      <TopNavigation onSearch={setQuery} />
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Your boards</h1>
            <p className="text-sm text-muted-foreground">Pick up where you left off, or start something new.</p>
          </div>
          <CreateBoardButton />
        </div>

        {isLoading && <BoardGridSkeleton />}

        {isError && <ErrorState message="Couldn't load your boards." onRetry={() => refetch()} />}

        {!isLoading && !isError && filtered.length === 0 && (boards?.length ?? 0) === 0 && (
          <EmptyState
            icon={LayoutGrid}
            title="No boards yet"
            description="Create your first whiteboard and start turning ideas into diagrams."
          />
        )}

        {!isLoading && !isError && filtered.length === 0 && (boards?.length ?? 0) > 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">No boards match &ldquo;{query}&rdquo;.</p>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <BoardGrid boards={filtered} onDelete={handleDelete} onDuplicate={(id) => duplicateBoard.mutate(id)} onRename={handleRename} />
        )}
      </main>
    </DashboardLayout>
  );
}
