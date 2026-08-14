import { z } from "zod";

export const elementTypeSchema = z.enum([
  "rectangle",
  "diamond",
  "ellipse",
  "line",
  "arrow",
  "freehand",
  "text",
  "image",
]);

const boundTextSchema = z
  .object({
    text: z.string(),
    fontSize: z.number(),
    fontFamily: z.enum(["sans", "serif", "mono", "hand"]),
    textAlign: z.enum(["left", "center", "right"]),
  })
  .nullable();

export const boardElementSchema = z
  .object({
    id: z.string(),
    type: elementTypeSchema,
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    rotation: z.number(),
    strokeColor: z.string(),
    backgroundColor: z.string(),
    strokeWidth: z.number(),
    strokeStyle: z.enum(["solid", "dashed", "dotted"]),
    fillStyle: z.enum(["solid", "hachure", "none"]),
    opacity: z.number().min(0).max(100),
    sloppiness: z.enum(["architect", "artist", "normal"]).optional(),
    edges: z.enum(["sharp", "rounded"]).optional(),
    boundText: boundTextSchema.optional(),
    locked: z.boolean(),
    seed: z.number(),
    createdAt: z.number(),
    updatedAt: z.number(),
  })
  .passthrough();

export const boardDocumentSchema = z.object({
  elements: z.array(boardElementSchema),
  backgroundColor: z.string(),
  version: z.number(),
});

export const createBoardSchema = z.object({
  name: z.string().min(1, "Name is required").max(120).default("Untitled board"),
  // Present when migrating a guest's locally-drafted board into their
  // account on first sign-in (see frontend/lib/guest-migration.ts).
  document: boardDocumentSchema.optional(),
});

export const updateBoardSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  document: boardDocumentSchema.optional(),
  expectedVersion: z.number().optional(),
});

export const boardIdParamSchema = z.object({
  boardId: z.string().min(1),
});
