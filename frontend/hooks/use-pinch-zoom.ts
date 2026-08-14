"use client";

import { useCallback, useRef } from "react";
import { zoomAtPoint } from "@whiteboard/editor-core";
import { useCameraStore } from "@/stores/camera-store";

interface ActivePointer {
  x: number;
  y: number;
}

/**
 * Two-finger pinch-to-zoom for touch devices. Pointer Events report each
 * touch as a separate pointer id, so this tracks every currently-down
 * pointer in a map; the moment a second one appears, it takes over from
 * whatever single-pointer interaction (draw/select/pan) was in progress --
 * returning `true` tells the caller to abort that interaction so a second
 * finger touching down mid-draw doesn't leave a half-finished element
 * behind. Zoom is anchored at the midpoint between the two touches so the
 * content under your fingers stays under your fingers, the same feel as
 * native pinch-zoom in maps/photo apps.
 */
export function usePinchZoom(getCanvasRect: () => DOMRect | null) {
  const pointers = useRef(new Map<number, ActivePointer>());
  const lastDistance = useRef<number | null>(null);

  const isPinching = useCallback(() => pointers.current.size >= 2, []);

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    if (event.pointerType !== "touch") return false;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      lastDistance.current = distanceBetween(pointers.current);
      return true; // signal: abort any other in-progress single-pointer interaction
    }
    return false;
  }, []);

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!pointers.current.has(event.pointerId)) return false;
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.current.size < 2) return false;

      const distance = distanceBetween(pointers.current);
      if (lastDistance.current === null || distance === null) {
        lastDistance.current = distance;
        return true;
      }

      const rect = getCanvasRect();
      const mid = midpoint(pointers.current);
      const { camera, setCamera } = useCameraStore.getState();
      const scaleDelta = distance / lastDistance.current;
      const nextZoom = camera.zoom * scaleDelta;
      setCamera(
        zoomAtPoint(camera, mid.x - (rect?.left ?? 0), mid.y - (rect?.top ?? 0), nextZoom)
      );
      lastDistance.current = distance;
      return true;
    },
    [getCanvasRect]
  );

  const onPointerUp = useCallback((event: React.PointerEvent) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) lastDistance.current = null;
  }, []);

  return { isPinching, onPointerDown, onPointerMove, onPointerUp };
}

function distanceBetween(pointers: Map<number, ActivePointer>): number | null {
  const [a, b] = Array.from(pointers.values());
  if (!a || !b) return null;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(pointers: Map<number, ActivePointer>): { x: number; y: number } {
  const values = Array.from(pointers.values());
  const x = values.reduce((sum, p) => sum + p.x, 0) / values.length;
  const y = values.reduce((sum, p) => sum + p.y, 0) / values.length;
  return { x, y };
}
