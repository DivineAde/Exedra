import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyToken } from "../modules/authentication/authentication.service";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
  }
}

const COOKIE_NAME = "whiteboard_token";

/** Extracts and verifies the JWT from either the httpOnly cookie or the
 * Authorization header, and attaches `request.userId`. Never trusts a
 * client-supplied userId in the body/query. */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers.authorization;
  const bearerToken = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const cookieToken = request.cookies[COOKIE_NAME];
  const token = bearerToken ?? cookieToken;

  if (!token) {
    return reply.status(401).send({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required" },
    });
  }

  try {
    const payload = verifyToken(token);
    request.userId = payload.userId;
  } catch {
    return reply.status(401).send({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Invalid or expired session" },
    });
  }
}
