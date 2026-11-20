"use client";

import { BoardCard, type BoardCardProps } from "./BoardCard";
import { NewBoardTile } from "./CreateBoardButton";
import type { BoardSummaryDTO } from "@whiteboard/shared-types";

interface BoardGridProps extends Omit<BoardCardProps, "board" | "view"> {
  boards: BoardSummaryDTO[];
  view?: "grid" | "list";
  /** Show the blank-board tile as the first grid item. */
  showNewTile?: boolean;
}

export function BoardGrid({ boards, view = "grid", showNewTile = false, ...handlers }: BoardGridProps) {
  if (view === "list") {
    return (
      <div className="divide-y overflow-hidden rounded-2xl border bg-card">
        {boards.map((board) => (
          <BoardCard key={board.id} board={board} view="list" {...handlers} />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {showNewTile && <NewBoardTile />}
      {boards.map((board) => (
        <BoardCard key={board.id} board={board} {...handlers} />
      ))}
    </div>
  );
}
