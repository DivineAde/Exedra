import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import websocket from "@fastify/websocket";
import oauthPlugin from "@fastify/oauth2";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error-handler";
import { authenticationRoutes } from "./modules/authentication/authentication.routes";
import { boardsRoutes } from "./modules/boards/boards.routes";
import { boardMembersRoutes } from "./modules/board-members/board-members.routes";
import { fileStorageRoutes } from "./modules/file-storage/file-storage.routes";
import { healthRoutes } from "./modules/health/health.routes";
import { collaborationGateway } from "./modules/collaboration/collaboration.gateway";
import { registerProcessSafetyNets } from "./process-safety";

async function buildServer() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "development" ? "info" : "warn",
      transport: env.NODE_ENV === "development" ? { target: "pino-pretty" } : undefined,
    },
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  await app.register(cookie);

  await app.register(rateLimit, {
    max: 200,
    timeWindow: "1 minute",
  });

  await app.register(websocket);

  // Google OAuth is opt-in: only registered when credentials are present,
  // so the app runs fine without them (email/password auth still works,
  // and the frontend simply hides the "Continue with Google" button).
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    await app.register(oauthPlugin, {
      name: "googleOAuth2",
      scope: ["profile", "email"],
      credentials: {
        client: { id: env.GOOGLE_CLIENT_ID, secret: env.GOOGLE_CLIENT_SECRET },
        auth: oauthPlugin.GOOGLE_CONFIGURATION,
      },
      startRedirectPath: "/api/auth/google",
      callbackUri: `${env.BACKEND_URL}/api/auth/google/callback`,
    });
  }

  app.setErrorHandler(errorHandler);

  await app.register(healthRoutes);
  await app.register(authenticationRoutes);
  await app.register(boardsRoutes);
  await app.register(boardMembersRoutes);
  await app.register(fileStorageRoutes);
  await app.register(collaborationGateway);

  return app;
}

async function main() {
  const app = await buildServer();
  registerProcessSafetyNets(app.log);
  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    app.log.info(`Backend listening on http://localhost:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
