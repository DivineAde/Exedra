import type { FastifyInstance } from "fastify";
import { createBoardSchema, updateBoardSchema, boardIdParamSchema } from "@whiteboard/validation";
import type { UpdateBoardInput, CreateBoardInput } from "@whiteboard/shared-types";
import { requireAuth } from "../../middleware/require-auth";
import { requireBoardRole } from "./boards.permissions";
import {
  listBoardsForUser,
  createBoard,
  getBoardForUser,
  updateBoard,
  deleteBoard,
  duplicateBoard,
} from "./boards.service";
import { toBoardDTO, toBoardSummaryDTO } from "./boards.mapper";

export async function boardsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireAuth);

  app.get("/api/boards", async (request, reply) => {
    const boards = await listBoardsForUser(request.userId!);
    return reply.send({
      success: true,
      data: boards.map(({ board, role }) => toBoardSummaryDTO(board, role)),
    });
  });

  app.post("/api/boards", async (request, reply) => {
    const body = createBoardSchema.parse(request.body ?? {}) as CreateBoardInput;
    const board = await createBoard(request.userId!, body);
    return reply.status(201).send({ success: true, data: toBoardDTO(board, "OWNER") });
  });

  app.get("/api/boards/:boardId", async (request, reply) => {
    const { boardId } = boardIdParamSchema.parse(request.params);
    const { board, role } = await getBoardForUser(boardId, request.userId!);
    return reply.send({ success: true, data: toBoardDTO(board, role) });
  });

  app.patch("/api/boards/:boardId", async (request, reply) => {
    const { boardId } = boardIdParamSchema.parse(request.params);
    // Zod's inferred type for the passthrough element schema is structurally
    // looser than the discriminated BoardElement union; the runtime shape
    // (validated above) is what matters, so we assert the shared DTO type.
    const body = updateBoardSchema.parse(request.body) as UpdateBoardInput;
    // Viewers may not write; editors and owners may.
    const role = await requireBoardRole(boardId, request.userId!, "EDITOR");
    const board = await updateBoard(boardId, body);
    return reply.send({ success: true, data: toBoardDTO(board, role) });
  });

  app.delete("/api/boards/:boardId", async (request, reply) => {
    const { boardId } = boardIdParamSchema.parse(request.params);
    await requireBoardRole(boardId, request.userId!, "OWNER");
    await deleteBoard(boardId);
    return reply.status(204).send();
  });

  app.post("/api/boards/:boardId/duplicate", async (request, reply) => {
    const { boardId } = boardIdParamSchema.parse(request.params);
    await requireBoardRole(boardId, request.userId!, "VIEWER");
    const board = await duplicateBoard(boardId, request.userId!);
    return reply.status(201).send({ success: true, data: toBoardDTO(board, "OWNER") });
  });
}
