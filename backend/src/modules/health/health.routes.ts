import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/api/health", async () => ({
    success: true,
    data: { status: "ok", timestamp: new Date().toISOString() },
  }));

  app.get("/api/config", async () => ({
    success: true,
    data: {
      googleAuthEnabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  }));
}
