import type { BoardSummaryDTO } from "@whiteboard/shared-types";

export type BoardFilter = "all" | "recent" | "shared";
export type BoardSort = "edited" | "name" | "created";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function isRecent(board: BoardSummaryDTO) {
  return Date.now() - new Date(board.updatedAt).getTime() < WEEK_MS;
}

export function parseFilter(value: string | null): BoardFilter {
  return value === "recent" || value === "shared" ? value : "all";
}

export function applyFilter(boards: BoardSummaryDTO[], filter: BoardFilter) {
  if (filter === "recent") return boards.filter(isRecent);
  if (filter === "shared") return boards.filter((b) => b.role !== "OWNER");
  return boards;
}

export function sortBoards(boards: BoardSummaryDTO[], sort: BoardSort) {
  const copy = [...boards];
  if (sort === "name") return copy.sort((a, b) => a.name.localeCompare(b.name));
  const key = sort === "created" ? "createdAt" : "updatedAt";
  return copy.sort((a, b) => new Date(b[key]).getTime() - new Date(a[key]).getTime());
}
