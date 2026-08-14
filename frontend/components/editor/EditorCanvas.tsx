"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { renderFrame } from "@/editor/rendering/canvas-renderer";
import { useEditorStore } from "@/stores/editor-store";
import { useCameraStore } from "@/stores/camera-store";
import { useSelectionStore } from "@/stores/selection-store";
import { useCanvasInteractions } from "@/hooks/use-canvas-interactions";
import { usePinchZoom } from "@/hooks/use-pinch-zoom";
import { useTextEditing } from "@/hooks/use-text-editing";
import { zoomAtPoint, screenToWorld, hitTestElement } from "@whiteboard/editor-core";
import { useUiStore } from "@/stores/ui-store";
import { RemoteCursors } from "./RemoteCursor";
import { TextEditorOverlay } from "./TextEditorOverlay";

interface EditorCanvasProps {
  onCursorMove?: (worldX: number, worldY: number) => void;
}

/**
 * Owns the <canvas> element and the requestAnimationFrame render loop.
 * Reads Zustand state imperatively on each frame rather than subscribing
 * via React, so canvas drawing never triggers (or waits on) a React re-render.
 */
export function EditorCanvas({ onCursorMove }: EditorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const { activeTool, setActiveTool } = useUiStore();
  const camera = useCameraStore((s) => s.camera);

  const getCanvasRect = useCallback(() => containerRef.current?.getBoundingClientRect() ?? null, []);
  const { onPointerDown, onPointerMove, onPointerUp, marqueeRect, toWorld, cancelInteraction } =
    useCanvasInteractions(getCanvasRect);
  const pinch = usePinchZoom(getCanvasRect);
  const { session, startStandaloneText, startBoundTextEdit, commit, cancel } = useTextEditing();

  // Render loop
  const marqueeRectRef = useRef(marqueeRect);
  marqueeRectRef.current = marqueeRect;
  const editingElementIdRef = useRef<string | null>(session?.elementId ?? null);
  editingElementIdRef.current = session?.elementId ?? null;
  const isDarkModeRef = useRef(resolvedTheme === "dark");
  isDarkModeRef.current = resolvedTheme === "dark";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    function resize() {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    }
    resize();
    window.addEventListener("resize", resize);
    // A ResizeObserver catches container size changes that don't fire a
    // window resize event (e.g. a layout shift from a panel appearing) --
    // window.resize alone is a partial fix for "canvas resize handling".
    const resizeObserver = new ResizeObserver(resize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    function frame() {
      if (!canvas || !ctx) return;
      const { document } = useEditorStore.getState();
      const { camera } = useCameraStore.getState();
      const { selectedIds, hoveredId } = useSelectionStore.getState();

      renderFrame(ctx, canvas.width / dpr, canvas.height / dpr, camera, document, {
        selectedIds: new Set(selectedIds),
        hoveredId,
        isDarkMode: isDarkModeRef.current,
        selectionRect: marqueeRectToScreen(marqueeRectRef.current, camera),
        editingElementId: editingElementIdRef.current,
        dpr,
      });

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      resizeObserver.disconnect();
    };
    // Intentionally mount-only: the loop reads marqueeRect/session/theme via
    // refs (updated above on every render, cheap) rather than depending on
    // them directly. Restarting the rAF loop and resize listener on every
    // marquee-drag pixel or text-edit keystroke was itself a source of
    // visible flicker/jank during interaction -- a stable, long-lived loop
    // that only ever reads fresh state is what a 60fps canvas needs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePointerDown(event: React.PointerEvent) {
    if (pinch.onPointerDown(event)) {
      // A second touch point just landed -- abort whatever single-pointer
      // gesture (draw/select/marquee) was in progress and hand off fully
      // to pinch-zoom until the fingers lift.
      cancelInteraction();
      return;
    }
    if (activeTool === "text") {
  if (session) {
    // A text session is already open -- this click is the user clicking
    // away to finish it. The textarea's onBlur handles that commit, but
    // blur can fire *after* this pointerdown in some browsers, so
    // without this guard the stale activeTool ("text") causes a brand
    // new text box to spawn right where they clicked, instead of
    // returning to Select. Just let the blur do its job.
    return;
  }
  event.preventDefault();
  const world = toWorld(event.clientX, event.clientY);
  startStandaloneText(world.x, world.y);
  return;
}
    onPointerDown(event);
  }

  function handleDoubleClick(event: React.MouseEvent) {
    if (session) return;
    const world = toWorld(event.clientX, event.clientY);
    const { document } = useEditorStore.getState();
    const hit = [...document.elements].reverse().find((el) => hitTestElement(world.x, world.y, el));
    if (hit && startBoundTextEdit(hit)) {
      setActiveTool("select");
    }
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (pinch.onPointerMove(event)) return; // pinch handled it -- don't also run single-pointer logic
    onPointerMove(event);
    if (onCursorMove) {
      const rect = getCanvasRect();
      const { camera } = useCameraStore.getState();
      const world = screenToWorld(event.clientX - (rect?.left ?? 0), event.clientY - (rect?.top ?? 0), camera);
      onCursorMove(world.x, world.y);
    }
  }

  function handlePointerUp(event: React.PointerEvent) {
    pinch.onPointerUp(event);
    onPointerUp(event);
  }

  function handleWheel(event: React.WheelEvent) {
    event.preventDefault();
    const rect = getCanvasRect();
    const sx = event.clientX - (rect?.left ?? 0);
    const sy = event.clientY - (rect?.top ?? 0);
    const { camera, setCamera } = useCameraStore.getState();

    if (event.ctrlKey || event.metaKey) {
      // Pinch-to-zoom on trackpads is reported as a ctrl+wheel event
      const nextZoom = camera.zoom * (1 - event.deltaY * 0.01);
      setCamera(zoomAtPoint(camera, sx, sy, nextZoom));
    } else {
      setCamera({ ...camera, x: camera.x + event.deltaX / camera.zoom, y: camera.y + event.deltaY / camera.zoom });
    }
  }

  const cursor =
    activeTool === "hand" ? "grab" : activeTool === "select" ? "default" : activeTool === "text" ? "text" : "crosshair";

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full touch-none overflow-hidden bg-background"
      style={{ cursor }}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Whiteboard canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        className="absolute inset-0"
      />
      <RemoteCursors />
      {session && <TextEditorOverlay session={session} camera={camera} onCommit={commit} onCancel={cancel} />}
    </div>
  );
}

function marqueeRectToScreen(
  rect: { x: number; y: number; width: number; height: number } | null,
  camera: { x: number; y: number; zoom: number }
) {
  if (!rect) return null;
  return {
    x: (rect.x - camera.x) * camera.zoom,
    y: (rect.y - camera.y) * camera.zoom,
    width: rect.width * camera.zoom,
    height: rect.height * camera.zoom,
  };
}
