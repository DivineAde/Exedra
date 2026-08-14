"use client";

import { BoardCard } from "./BoardCard";
import type { BoardSummaryDTO } from "@whiteboard/shared-types";

interface BoardGridProps {
  boards: BoardSummaryDTO[];
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string) => void;
}

export function BoardGrid({ boards, onDelete, onDuplicate, onRename }: BoardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {boards.map((board) => (
        <BoardCard key={board.id} board={board} onDelete={onDelete} onDuplicate={onDuplicate} onRename={onRename} />
      ))}
    </div>
  );
}
