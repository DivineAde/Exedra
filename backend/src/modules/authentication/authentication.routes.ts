import type { FastifyInstance } from "fastify";
import { registerSchema, loginSchema } from "@whiteboard/validation";
import { registerUser, loginUser, getUserById, signToken } from "./authentication.service";
import { findOrCreateGoogleUser } from "./google-oauth.service";
import { requireAuth } from "../../middleware/require-auth";
import { toUserDTO } from "../users/users.mapper";
import { env } from "../../config/env";

const COOKIE_NAME = "whiteboard_token";

function setSessionCookie(reply: import("fastify").FastifyReply, token: string) {
  reply.setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function authenticationRoutes(app: FastifyInstance) {
  app.post("/api/auth/register", async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const { user, token } = await registerUser(body);
    setSessionCookie(reply, token);
    return reply.status(201).send({ success: true, data: { user: toUserDTO(user), token } });
  });

  app.post("/api/auth/login", async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const { user, token } = await loginUser(body);
    setSessionCookie(reply, token);
    return reply.send({ success: true, data: { user: toUserDTO(user), token } });
  });

  app.post("/api/auth/logout", async (_request, reply) => {
    reply.clearCookie(COOKIE_NAME, { path: "/" });
    return reply.send({ success: true, data: null });
  });

  app.get("/api/auth/me", { preHandler: requireAuth }, async (request, reply) => {
    const user = await getUserById(request.userId!);
    if (!user) return reply.status(404).send({ success: false, error: { code: "NOT_FOUND", message: "User not found" } });
    return reply.send({ success: true, data: toUserDTO(user) });
  });

  // --- Google OAuth ---
  // Requires GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET to be set; if they're
  // absent the plugin below is never registered (see server.ts), and the
  // frontend hides the "Continue with Google" button accordingly.
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    app.get("/api/auth/google/callback", async (request, reply) => {
      try {
        // `app.googleOAuth2` is decorated by @fastify/oauth2 (see the
        // `name: "googleOAuth2"` option in server.ts) -- its module
        // augmentation only types index-signature access, not the literal
        // property name, hence the one narrow cast here.
        const oauth2 = (app as unknown as { googleOAuth2: import("@fastify/oauth2").OAuth2Namespace }).googleOAuth2;
        const { token } = await oauth2.getAccessTokenFromAuthorizationCodeFlow(request);

        const user = await findOrCreateGoogleUser(token.access_token);
        const sessionToken = signToken(user.id);
        setSessionCookie(reply, sessionToken);

        // Hand the raw token back via a URL fragment (not a query string,
        // so it never hits server logs) for the frontend to pick up and
        // store for the WebSocket handshake, then redirect into the app.
        return reply.redirect(`${env.FRONTEND_URL}/auth/callback#token=${sessionToken}`);
      } catch (err) {
        request.log.error(err);
        return reply.redirect(`${env.FRONTEND_URL}/login?error=google_auth_failed`);
      }
    });
  }
}
