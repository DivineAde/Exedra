"use client";

import { useCallback, useRef, useState } from "react";
import {
  screenToWorld,
  createElementByType,
  hitTestElement,
  elementIntersectsRect,
  type ResizeHandle,
} from "@whiteboard/editor-core";
import { useEditorStore } from "@/stores/editor-store";
import { useCameraStore } from "@/stores/camera-store";
import { useSelectionStore } from "@/stores/selection-store";
import { useUiStore } from "@/stores/ui-store";

interface DragState {
  mode: "draw" | "move" | "marquee" | "pan" | "resize" | "erase" | null;
  startWorld: { x: number; y: number };
  elementId?: string;
  resizeHandle?: ResizeHandle;
}

const isTwoPointType = (type: string) => type === "line" || type === "arrow";

/** Owns all pointer-driven canvas interaction: drawing new shapes,
 * selecting/moving/resizing existing ones, marquee selection, erasing,
 * and hand-tool panning. Kept out of the render loop entirely -- this
 * hook only ever mutates Zustand state, which the renderer reads each frame.
 *
 * Panning intentionally uses raw `event.movementX/Y` (screen-space deltas)
 * rather than re-deriving a "world" delta from screenToWorld() each event.
 * The latter reads the camera position that the same drag is mutating, so
 * on any event ordering/render-timing hiccup the delta briefly compounds
 * or cancels itself out -- which is what caused the old shake/jitter. Raw
 * pointer movement has no such feedback loop. */
export function useCanvasInteractions(getCanvasRect: () => DOMRect | null) {
  const { document: doc, createElement, updateElement, moveElements, deleteElements } = useEditorStore();
  const { camera, pan } = useCameraStore();
  const { selectedIds, select, clearSelection, setHovered } = useSelectionStore();
  const { activeTool, setActiveTool } = useUiStore();

  const drag = useRef<DragState>({ mode: null, startWorld: { x: 0, y: 0 } });
  const [marqueeRect, setMarqueeRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [drawingElementId, setDrawingElementId] = useState<string | null>(null);

  const toWorld = useCallback(
    (clientX: number, clientY: number) => {
      const rect = getCanvasRect();
      const sx = clientX - (rect?.left ?? 0);
      const sy = clientY - (rect?.top ?? 0);
      return screenToWorld(sx, sy, camera);
    },
    [camera, getCanvasRect]
  );

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      const world = toWorld(event.clientX, event.clientY);
      (event.target as Element).setPointerCapture?.(event.pointerId);

      if (activeTool === "hand" || event.button === 1) {
        drag.current = { mode: "pan", startWorld: world };
        return;
      }

      if (activeTool === "eraser") {
        const hit = [...doc.elements].reverse().find((el) => hitTestElement(world.x, world.y, el));
        if (hit) deleteElements([hit.id]);
        drag.current = { mode: "erase", startWorld: world };
        return;
      }

      if (activeTool === "select") {
        const hit = [...doc.elements].reverse().find((el) => hitTestElement(world.x, world.y, el));
        if (hit) {
          if (!selectedIds.includes(hit.id)) select([hit.id]);
          drag.current = { mode: "move", startWorld: world, elementId: hit.id };
        } else {
          clearSelection();
          drag.current = { mode: "marquee", startWorld: world };
          setMarqueeRect({ x: world.x, y: world.y, width: 0, height: 0 });
        }
        return;
      }

      if (activeTool === "text") {
        // Text creation/editing is handled by TextEditorOverlay, which
        // listens for the same pointerdown via onRequestTextEdit. Nothing
        // to drag here.
        return;
      }

      // Shape/line/arrow/freehand drawing tools
      const element = createElementByType(activeTool, world.x, world.y);
      createElement(element);
      setDrawingElementId(element.id);
      drag.current = { mode: "draw", startWorld: world, elementId: element.id };
    },
    [activeTool, doc.elements, selectedIds, select, clearSelection, createElement, deleteElements, toWorld]
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      const state = drag.current;

      if (!state.mode) {
        const world = toWorld(event.clientX, event.clientY);
        const hit = [...doc.elements].reverse().find((el) => hitTestElement(world.x, world.y, el));
        setHovered(hit?.id ?? null);
        return;
      }

      if (state.mode === "pan") {
        pan(-event.movementX / camera.zoom, -event.movementY / camera.zoom);
        return;
      }

      const world = toWorld(event.clientX, event.clientY);

      if (state.mode === "erase") {
        const hit = [...doc.elements].reverse().find((el) => hitTestElement(world.x, world.y, el));
        if (hit) deleteElements([hit.id]);
        return;
      }

      if (state.mode === "move" && selectedIds.length) {
        moveElements(selectedIds, event.movementX / camera.zoom, event.movementY / camera.zoom);
      } else if (state.mode === "draw" && state.elementId) {
        const el = doc.elements.find((e) => e.id === state.elementId);
        if (el && isTwoPointType(el.type)) {
          // Lines/arrows are always exactly [start, end] -- replacing the
          // second point (not appending) is what keeps them geometrically
          // straight regardless of how the cursor wobbles while dragging.
          const localX = world.x - el.x;
          const localY = world.y - el.y;
          updateElement(el.id, { points: [[0, 0], [localX, localY]] } as never);
        } else if (el && el.type === "freehand") {
          const localX = world.x - el.x;
          const localY = world.y - el.y;
          updateElement(el.id, { points: [...el.points, [localX, localY]] } as never);
        } else if (el) {
          updateElement(el.id, {
            width: world.x - state.startWorld.x,
            height: world.y - state.startWorld.y,
          });
        }
      } else if (state.mode === "marquee") {
        setMarqueeRect({
          x: Math.min(state.startWorld.x, world.x),
          y: Math.min(state.startWorld.y, world.y),
          width: Math.abs(world.x - state.startWorld.x),
          height: Math.abs(world.y - state.startWorld.y),
        });
      }
    },
    [doc.elements, selectedIds, camera.zoom, pan, moveElements, updateElement, deleteElements, setHovered, toWorld]
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent) => {
      const state = drag.current;
      (event.target as Element).releasePointerCapture?.(event.pointerId);

      if (state.mode === "marquee" && marqueeRect) {
        const rectWorld = {
          minX: marqueeRect.x,
          minY: marqueeRect.y,
          maxX: marqueeRect.x + marqueeRect.width,
          maxY: marqueeRect.y + marqueeRect.height,
        };
        const hits = doc.elements.filter((el) => elementIntersectsRect(el, rectWorld)).map((el) => el.id);
        select(hits);
        setMarqueeRect(null);
      }

      if (state.mode === "draw") {
        setActiveTool("select");
        if (state.elementId) select([state.elementId]);
      }

      setDrawingElementId(null);
      drag.current = { mode: null, startWorld: { x: 0, y: 0 } };
    },
    [marqueeRect, doc.elements, select, setActiveTool]
  );

  /** Aborts whatever single-pointer interaction is in progress without
   * finalizing it (no marquee-select commit, no tool switch). Used when a
   * second touch point arrives mid-gesture and pinch-zoom needs to take
   * over -- see hooks/use-pinch-zoom.ts -- so a second finger touching
   * down mid-draw doesn't leave a half-finished element or a stuck
   * marquee rectangle behind. */
  const cancelInteraction = useCallback(() => {
    drag.current = { mode: null, startWorld: { x: 0, y: 0 } };
    setMarqueeRect(null);
    setDrawingElementId(null);
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp, marqueeRect, drawingElementId, toWorld, cancelInteraction };
}
