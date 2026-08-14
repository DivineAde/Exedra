import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../middleware/require-auth";
import { createPresignedUpload } from "../../infrastructure/storage/presign";

const presignSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().regex(/^image\//, "Only image uploads are supported"),
  sizeBytes: z.number().max(10 * 1024 * 1024, "Max file size is 10MB"),
});

export async function fileStorageRoutes(app: FastifyInstance) {
  app.post("/api/files/presigned-url", { preHandler: requireAuth }, async (request, reply) => {
    const body = presignSchema.parse(request.body);
    const presigned = createPresignedUpload(body.fileName, body.contentType);
    return reply.send({ success: true, data: presigned });
  });
}
