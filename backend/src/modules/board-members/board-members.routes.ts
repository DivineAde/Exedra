import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { boardIdParamSchema } from "@whiteboard/validation";
import { requireAuth } from "../../middleware/require-auth";
import { requireBoardRole } from "../boards/boards.permissions";
import {
  listBoardMembers,
  addBoardMember,
  updateBoardMemberRole,
  removeBoardMember,
} from "./board-members.service";

const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["EDITOR", "VIEWER"]).default("EDITOR"),
});

const updateMemberSchema = z.object({
  role: z.enum(["EDITOR", "VIEWER"]),
});

export async function boardMembersRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireAuth);

  app.get("/api/boards/:boardId/members", async (request, reply) => {
    const { boardId } = boardIdParamSchema.parse(request.params);
    await requireBoardRole(boardId, request.userId!, "VIEWER");
    const members = await listBoardMembers(boardId);
    return reply.send({ success: true, data: members });
  });

  app.post("/api/boards/:boardId/members", async (request, reply) => {
    const { boardId } = boardIdParamSchema.parse(request.params);
    await requireBoardRole(boardId, request.userId!, "OWNER");
    const body = addMemberSchema.parse(request.body);
    const member = await addBoardMember(boardId, body.email, body.role);
    return reply.status(201).send({ success: true, data: member });
  });

  app.patch("/api/boards/:boardId/members/:userId", async (request, reply) => {
    const { boardId } = boardIdParamSchema.parse(request.params);
    const { userId: targetUserId } = z.object({ userId: z.string() }).parse(request.params);
    await requireBoardRole(boardId, request.userId!, "OWNER");
    const body = updateMemberSchema.parse(request.body);
    const member = await updateBoardMemberRole(boardId, targetUserId, body.role);
    return reply.send({ success: true, data: member });
  });

  app.delete("/api/boards/:boardId/members/:userId", async (request, reply) => {
    const { boardId } = boardIdParamSchema.parse(request.params);
    const { userId: targetUserId } = z.object({ userId: z.string() }).parse(request.params);
    await requireBoardRole(boardId, request.userId!, "OWNER");
    await removeBoardMember(boardId, targetUserId);
    return reply.status(204).send();
  });
}
