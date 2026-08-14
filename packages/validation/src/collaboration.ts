import { z } from "zod";
import { boardElementSchema } from "./board";

export const clientEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("board:join"), boardId: z.string() }),
  z.object({ type: z.literal("board:leave"), boardId: z.string() }),
  z.object({
    type: z.literal("element:create"),
    boardId: z.string(),
    element: boardElementSchema,
    version: z.number(),
  }),
  z.object({
    type: z.literal("element:update"),
    boardId: z.string(),
    elementId: z.string(),
    changes: boardElementSchema.partial(),
    version: z.number(),
  }),
  z.object({
    type: z.literal("element:delete"),
    boardId: z.string(),
    elementId: z.string(),
    version: z.number(),
  }),
  z.object({
    type: z.literal("cursor:update"),
    boardId: z.string(),
    x: z.number(),
    y: z.number(),
  }),
  z.object({
    type: z.literal("selection:update"),
    boardId: z.string(),
    elementIds: z.array(z.string()),
  }),
]);
