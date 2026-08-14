import { prisma } from "../../infrastructure/database/prisma";
import { NotFoundError } from "../authentication/authentication.errors";
import type { BoardRole } from "@whiteboard/shared-types";

export async function listBoardMembers(boardId: string) {
  const board = await prisma.board.findUniqueOrThrow({
    where: { id: boardId },
    include: { owner: true, members: { include: { user: true } } },
  });

  const owner = {
    id: `owner-${board.owner.id}`,
    boardId,
    userId: board.owner.id,
    name: board.owner.name,
    email: board.owner.email,
    avatarUrl: board.owner.avatarUrl,
    role: "OWNER" as const,
  };

  const members = board.members.map((m: (typeof board.members)[number]) => ({
    id: m.id,
    boardId,
    userId: m.user.id,
    name: m.user.name,
    email: m.user.email,
    avatarUrl: m.user.avatarUrl,
    role: m.role as BoardRole,
  }));

  return [owner, ...members];
}

export async function addBoardMember(boardId: string, email: string, role: BoardRole) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new NotFoundError("No user found with that email");

  return prisma.boardMember.upsert({
    where: { boardId_userId: { boardId, userId: user.id } },
    update: { role },
    create: { boardId, userId: user.id, role },
  });
}

export async function updateBoardMemberRole(boardId: string, userId: string, role: BoardRole) {
  return prisma.boardMember.update({
    where: { boardId_userId: { boardId, userId } },
    data: { role },
  });
}

export async function removeBoardMember(boardId: string, userId: string) {
  await prisma.boardMember.delete({ where: { boardId_userId: { boardId, userId } } });
}
