"use client";

import { useEffect, useRef } from "react";
import { BoardSocket } from "@/services/websocket-client";
import { useEditorStore } from "@/stores/editor-store";
import { useCollaborationStore } from "@/stores/collaboration-store";
import type { ServerToClientEvent } from "@whiteboard/shared-types";

/** Connects to the board's realtime room, applies remote element changes,
 * and tracks peer presence/cursors. Cursor updates are throttled on the
 * sending side (see EditorCanvas) and never touch the document/history. */
export function useCollaboration(boardId: string, token: string | null) {
  const socketRef = useRef<BoardSocket | null>(null);
  const { applyRemoteCreate, applyRemoteUpdate, applyRemoteDelete } = useEditorStore();
  const { setPresence, setRemoteCursor, setRemoteSelection, removeUser, setConnectionState } =
    useCollaborationStore();

  useEffect(() => {
    if (!token) return;
    setConnectionState("connecting");
    const socket = new BoardSocket(token);
    socketRef.current = socket;
    socket.connect();

    const unsubscribe = socket.subscribe((event: ServerToClientEvent) => {
      switch (event.type) {
        case "board:presence":
          setPresence(event.users);
          setConnectionState("connected");
          break;
        case "element:create":
          applyRemoteCreate(event.element);
          break;
        case "element:update":
          applyRemoteUpdate(event.elementId, event.changes);
          break;
        case "element:delete":
          applyRemoteDelete(event.elementId);
          break;
        case "cursor:update":
          setRemoteCursor(event.userId, { x: event.x, y: event.y });
          break;
        case "selection:update":
          setRemoteSelection(event.userId, event.elementIds);
          break;
      }
    });

    socket.send({ type: "board:join", boardId });

    return () => {
      socket.send({ type: "board:leave", boardId });
      unsubscribe();
      socket.close();
      setConnectionState("disconnected");
    };
  }, [boardId, token]);

  return socketRef;
}
