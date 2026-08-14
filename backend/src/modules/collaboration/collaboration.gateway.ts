import type { FastifyInstance } from "fastify";
import type { WebSocket } from "ws";
import { clientEventSchema } from "@whiteboard/validation";
import type { ServerToClientEvent } from "@whiteboard/shared-types";
import { verifyToken } from "../authentication/authentication.service";
import { getUserById } from "../authentication/authentication.service";
import { resolveBoardRole } from "../boards/boards.permissions";
import { roomManager } from "./room-manager";

const THROTTLE_MS = 33; // ~30 updates/sec cap on cursor broadcasts, never persisted

/**
 * WebSocket gateway: one connection per browser tab. A client can join
 * multiple board "rooms" over its lifetime (join/leave), and every
 * mutating event is re-validated against the user's server-side role
 * before being broadcast -- the socket never trusts client-asserted
 * permissions.
 */
export async function collaborationGateway(app: FastifyInstance) {
  app.get("/ws", { websocket: true }, (connection, request) => {
    const socket = connection as unknown as WebSocket;
    const url = new URL(request.url, "http://localhost");
    const token = url.searchParams.get("token");

    let userId: string;
    try {
      if (!token) throw new Error("missing token");
      userId = verifyToken(token).userId;
    } catch {
      socket.close(4001, "Unauthorized");
      return;
    }

    const joinedBoards = new Set<string>();
    let lastCursorSent = 0;

    socket.on("message", async (raw: Buffer) => {
      // Everything below this line runs inside an async event-listener
      // callback, which Fastify's request-level error handling does NOT
      // cover -- an unhandled rejection here previously crashed the whole
      // Node process (Node terminates on unhandled promise rejections by
      // default), taking down every other in-flight request with it and
      // requiring a manual restart. Wrapping the full handler body is the
      // fix; sendError() reports the problem to *this* client without
      // affecting anyone else's connection or the server process.
      try {
        let event;
        try {
          event = clientEventSchema.parse(JSON.parse(raw.toString()));
        } catch {
          sendError(socket, "Malformed message");
          return;
        }

        const role = await resolveBoardRole(event.boardId, userId);
        if (!role) {
          sendError(socket, "You do not have access to this board");
          return;
        }

        switch (event.type) {
          case "board:join": {
            const user = await getUserById(userId);
            roomManager.join(event.boardId, userId, socket, user?.name ?? "Anonymous", user?.avatarUrl ?? null);
            joinedBoards.add(event.boardId);
            roomManager.broadcastAll(event.boardId, {
              type: "board:presence",
              boardId: event.boardId,
              users: roomManager.presence(event.boardId),
            } satisfies ServerToClientEvent);
            break;
          }

          case "board:leave": {
            roomManager.leave(event.boardId, userId);
            joinedBoards.delete(event.boardId);
            roomManager.broadcastAll(event.boardId, {
              type: "board:presence",
              boardId: event.boardId,
              users: roomManager.presence(event.boardId),
            } satisfies ServerToClientEvent);
            break;
          }

          case "element:create":
          case "element:update":
          case "element:delete": {
            if (role === "VIEWER") {
              sendError(socket, "Viewers cannot edit this board");
              return;
            }
            roomManager.broadcast(event.boardId, userId, { ...event, userId } as ServerToClientEvent);
            break;
          }

          case "cursor:update": {
            const now = Date.now();
            if (now - lastCursorSent < THROTTLE_MS) return;
            lastCursorSent = now;
            roomManager.broadcast(event.boardId, userId, {
              type: "cursor:update",
              boardId: event.boardId,
              userId,
              x: event.x,
              y: event.y,
            } satisfies ServerToClientEvent);
            break;
          }

          case "selection:update": {
            roomManager.broadcast(event.boardId, userId, {
              type: "selection:update",
              boardId: event.boardId,
              userId,
              elementIds: event.elementIds,
            } satisfies ServerToClientEvent);
            break;
          }
        }
      } catch (err) {
        app.log.error({ err, userId }, "Unhandled error in WebSocket message handler");
        sendError(socket, "Something went wrong processing that update");
      }
    });

    socket.on("error", (err) => {
      // A transport-level socket error (e.g. a client disconnecting
      // mid-write) must not propagate as an uncaught exception either.
      app.log.warn({ err, userId }, "WebSocket transport error");
    });

    socket.on("close", () => {
      try {
        for (const boardId of joinedBoards) {
          roomManager.leave(boardId, userId);
          roomManager.broadcastAll(boardId, {
            type: "board:presence",
            boardId,
            users: roomManager.presence(boardId),
          } satisfies ServerToClientEvent);
        }
      } catch (err) {
        app.log.error({ err, userId }, "Error cleaning up WebSocket connection on close");
      }
    });
  });
}

function sendError(socket: WebSocket, message: string) {
  const payload: ServerToClientEvent = { type: "error", message };
  socket.send(JSON.stringify(payload));
}
