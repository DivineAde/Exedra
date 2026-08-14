import type { WebSocket } from "ws";
import type { PresenceUser } from "@whiteboard/shared-types";

interface ConnectedClient {
  socket: WebSocket;
  userId: string;
  user: PresenceUser;
}

const CURSOR_COLORS = ["#f06595", "#845ef7", "#339af0", "#20c997", "#fcc419", "#ff8787"];

function colorForUser(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  return CURSOR_COLORS[hash % CURSOR_COLORS.length]!;
}

/**
 * In-memory registry of who is connected to which board "room".
 * Presence is intentionally ephemeral: nothing here is written to
 * PostgreSQL. For a multi-instance backend deployment, swap the
 * in-process Map for Redis pub/sub fan-out (the `redis` client is
 * already wired up in infrastructure/redis for that purpose).
 */
export class RoomManager {
  private rooms = new Map<string, Map<string, ConnectedClient>>();

  join(boardId: string, userId: string, socket: WebSocket, name: string, avatarUrl: string | null) {
    if (!this.rooms.has(boardId)) this.rooms.set(boardId, new Map());
    const room = this.rooms.get(boardId)!;
    room.set(userId, {
      socket,
      userId,
      user: { userId, name, avatarUrl, color: colorForUser(userId) },
    });
  }

  leave(boardId: string, userId: string) {
    const room = this.rooms.get(boardId);
    room?.delete(userId);
    if (room && room.size === 0) this.rooms.delete(boardId);
  }

  leaveAll(userId: string) {
    for (const [boardId, room] of this.rooms) {
      if (room.has(userId)) this.leave(boardId, userId);
    }
  }

  presence(boardId: string): PresenceUser[] {
    const room = this.rooms.get(boardId);
    if (!room) return [];
    return Array.from(room.values()).map((c) => c.user);
  }

  /** Broadcast a message to every other client in the room. */
  broadcast(boardId: string, excludeUserId: string, message: unknown) {
    const room = this.rooms.get(boardId);
    if (!room) return;
    const payload = JSON.stringify(message);
    for (const [userId, client] of room) {
      if (userId === excludeUserId) continue;
      if (client.socket.readyState === client.socket.OPEN) {
        client.socket.send(payload);
      }
    }
  }

  broadcastAll(boardId: string, message: unknown) {
    const room = this.rooms.get(boardId);
    if (!room) return;
    const payload = JSON.stringify(message);
    for (const client of room.values()) {
      if (client.socket.readyState === client.socket.OPEN) {
        client.socket.send(payload);
      }
    }
  }
}

export const roomManager = new RoomManager();
