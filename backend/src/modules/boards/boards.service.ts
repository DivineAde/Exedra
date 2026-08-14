import { prisma } from "../../infrastructure/database/prisma";
import { ConflictError, NotFoundError } from "../authentication/authentication.errors";
import { createEmptyDocument } from "@whiteboard/editor-core";
import type { CreateBoardInput, UpdateBoardInput } from "@whiteboard/shared-types";
import { resolveBoardRole } from "./boards.permissions";

export async function listBoardsForUser(userId: string) {
  const owned = await prisma.board.findMany({ where: { ownerId: userId } });
  const memberships = await prisma.boardMember.findMany({
    where: { userId },
    include: { board: true },
  });

  const ownedWithRole = owned.map((board: (typeof owned)[number]) => ({ board, role: "OWNER" as const }));
  const memberWithRole = memberships.map((m: (typeof memberships)[number]) => ({ board: m.board, role: m.role }));

  const merged = [...ownedWithRole, ...memberWithRole];
  merged.sort((a, b) => b.board.updatedAt.getTime() - a.board.updatedAt.getTime());
  return merged;
}

export async function createBoard(userId: string, input: CreateBoardInput) {
  return prisma.board.create({
    data: {
      name: input.name || "Untitled board",
      ownerId: userId,
      document: (input.document ?? createEmptyDocument()) as never,
      version: input.document ? 1 : 0,
    },
  });
}

export async function getBoardForUser(boardId: string, userId: string) {
  const role = await resolveBoardRole(boardId, userId);
  if (!role) throw new NotFoundError("Board not found");
  const board = await prisma.board.findUniqueOrThrow({ where: { id: boardId } });
  return { board, role };
}

/**
 * Updates a board's document with optimistic concurrency control: the
 * client must send `expectedVersion`, the last server-persisted `Board.version`
 * it knows about (NOT the document's own internal per-edit counter used for
 * local undo/redo bookkeeping -- those are unrelated numbers). If another
 * save has landed since, we reject with a conflict rather than silently
 * clobbering it, and report the actual current version so the client can
 * resync and retry instead of getting stuck.
 */
export async function updateBoard(boardId: string, input: UpdateBoardInput) {
  const board = await prisma.board.findUniqueOrThrow({ where: { id: boardId } });

  if (
    input.expectedVersion !== undefined &&
    input.document !== undefined &&
    input.expectedVersion !== board.version
  ) {
    throw new ConflictError("Board was modified elsewhere. Please refresh.", {
      currentVersion: board.version,
    });
  }

  const nextVersion = input.document !== undefined ? board.version + 1 : board.version;

  const updated = await prisma.board.update({
    where: { id: boardId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.document !== undefined ? { document: input.document as never, version: nextVersion } : {}),
    },
  });

  // Periodic checkpoint for history/recovery -- not on every keystroke,
  // callers debounce before invoking updateBoard from the autosave path.
  if (input.document !== undefined) {
    await prisma.boardRevision.create({
      data: { boardId, version: nextVersion, document: input.document as never },
    });
  }

  return updated;
}

export async function deleteBoard(boardId: string) {
  await prisma.board.delete({ where: { id: boardId } });
}

export async function duplicateBoard(boardId: string, userId: string) {
  const source = await prisma.board.findUniqueOrThrow({ where: { id: boardId } });
  return prisma.board.create({
    data: {
      name: `${source.name} (copy)`,
      ownerId: userId,
      document: source.document as never,
      version: 0,
    },
  });
}
