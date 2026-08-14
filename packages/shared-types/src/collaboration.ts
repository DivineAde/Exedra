import type { BoardElement } from "@whiteboard/editor-core";

export type ClientToServerEvent =
  | { type: "board:join"; boardId: string }
  | { type: "board:leave"; boardId: string }
  | { type: "element:create"; boardId: string; element: BoardElement; version: number }
  | {
      type: "element:update";
      boardId: string;
      elementId: string;
      changes: Partial<BoardElement>;
      version: number;
    }
  | { type: "element:delete"; boardId: string; elementId: string; version: number }
  | { type: "cursor:update"; boardId: string; x: number; y: number }
  | { type: "selection:update"; boardId: string; elementIds: string[] };

export type ServerToClientEvent =
  | { type: "board:presence"; boardId: string; users: PresenceUser[] }
  | { type: "element:create"; boardId: string; element: BoardElement; userId: string; version: number }
  | {
      type: "element:update";
      boardId: string;
      elementId: string;
      changes: Partial<BoardElement>;
      userId: string;
      version: number;
    }
  | { type: "element:delete"; boardId: string; elementId: string; userId: string; version: number }
  | { type: "cursor:update"; boardId: string; userId: string; x: number; y: number }
  | { type: "selection:update"; boardId: string; userId: string; elementIds: string[] }
  | { type: "error"; message: string };

export interface PresenceUser {
  userId: string;
  name: string;
  avatarUrl: string | null;
  color: string;
}
