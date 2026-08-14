import { prisma } from "../../infrastructure/database/prisma";
import { ForbiddenError, NotFoundError } from "../authentication/authentication.errors";
import type { BoardRole } from "@whiteboard/shared-types";

const ROLE_RANK: Record<BoardRole, number> = { VIEWER: 0, EDITOR: 1, OWNER: 2 };

/**
 * Resolves the effective role a user has on a board, checking ownership
 * first, then explicit membership. Never derived from client input --
 * always looked up server-side from the database.
 */
export async function resolveBoardRole(boardId: string, userId: string): Promise<BoardRole | null> {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { ownerId: true },
  });
  if (!board) return null;
  if (board.ownerId === userId) return "OWNER";

  const membership = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId } },
  });
  return (membership?.role as BoardRole | undefined) ?? null;
}

export async function requireBoardRole(
  boardId: string,
  userId: string,
  minimumRole: BoardRole
): Promise<BoardRole> {
  const role = await resolveBoardRole(boardId, userId);
  if (!role) throw new NotFoundError("Board not found");
  if (ROLE_RANK[role] < ROLE_RANK[minimumRole]) {
    throw new ForbiddenError(`This action requires ${minimumRole} access`);
  }
  return role;
}
