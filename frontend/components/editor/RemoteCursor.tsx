"use client";

import { worldToScreen } from "@whiteboard/editor-core";
import { useCameraStore } from "@/stores/camera-store";
import { useCollaborationStore } from "@/stores/collaboration-store";
import { MousePointer2 } from "lucide-react";

export function RemoteCursors() {
  const camera = useCameraStore((s) => s.camera);
  const { presence, remoteCursors } = useCollaborationStore();

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {presence.map((user) => {
        const cursor = remoteCursors[user.userId];
        if (!cursor) return null;
        const screen = worldToScreen(cursor.x, cursor.y, camera);
        return (
          <div
            key={user.userId}
            className="absolute flex items-center gap-1 transition-transform duration-75"
            style={{ transform: `translate(${screen.x}px, ${screen.y}px)` }}
          >
            <MousePointer2 className="h-4 w-4" style={{ color: user.color }} fill={user.color} />
            <span
              className="rounded px-1.5 py-0.5 text-xs font-medium text-white shadow"
              style={{ backgroundColor: user.color }}
            >
              {user.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
