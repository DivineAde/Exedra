import type { Board, BoardRole } from "../../infrastructure/database/prisma";
import type { BoardDTO, BoardSummaryDTO } from "@whiteboard/shared-types";
import type { BoardDocument } from "@whiteboard/editor-core";

export function toBoardSummaryDTO(board: Board, role: BoardRole): BoardSummaryDTO {
  return {
    id: board.id,
    name: board.name,
    ownerId: board.ownerId,
    role: role as BoardSummaryDTO["role"],
    updatedAt: board.updatedAt.toISOString(),
    createdAt: board.createdAt.toISOString(),
    thumbnailUrl: board.thumbnailUrl,
  };
}

export function toBoardDTO(board: Board, role: BoardRole): BoardDTO {
  return {
    ...toBoardSummaryDTO(board, role),
    document: board.document as unknown as BoardDocument,
    version: board.version,
  };
}
