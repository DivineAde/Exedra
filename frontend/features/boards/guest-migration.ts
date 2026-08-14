import { apiClient } from "@/services/api-client";
import { getLocalBoard, clearLocalBoard, isLocalBoardMeaningful } from "@/lib/local-board-store";
import type { BoardDTO } from "@whiteboard/shared-types";

/**
 * Called right after a guest authenticates (email/password, register, or
 * Google). If they had a non-empty local board, upload it as their first
 * real board and clear local storage -- "progressive" auth per the spec:
 * guests never lose work by signing in.
 *
 * Returns the migrated board's id (to redirect straight into it) or null
 * if there was nothing to migrate.
 */
export async function migrateGuestBoardIfPresent(): Promise<string | null> {
  const local = await getLocalBoard();
  if (!isLocalBoardMeaningful(local)) return null;

  const board = await apiClient.post<BoardDTO>("/api/boards", {
    name: local.name,
    document: local.document,
  });
  await clearLocalBoard();
  return board.id;
}
