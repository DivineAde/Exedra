"use client";

import { Minus, Plus, Maximize } from "lucide-react";
import { useCameraStore } from "@/stores/camera-store";
import { useEditorStore } from "@/stores/editor-store";
import { getElementsBounds } from "@whiteboard/editor-core";

export function ZoomControls() {
  const { camera, setZoom, resetZoom, setCamera } = useCameraStore();
  const document = useEditorStore((s) => s.document);

  function fitToScreen() {
    const bounds = getElementsBounds(document.elements);
    if (!bounds) {
      resetZoom();
      setCamera({ x: 0, y: 0, zoom: 1 });
      return;
    }
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    const padding = 80;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const zoom = Math.min((viewportW - padding * 2) / width, (viewportH - padding * 2) / height, 2);
    setCamera({
      x: bounds.minX - padding / zoom,
      y: bounds.minY - padding / zoom,
      zoom: Math.max(zoom, 0.1),
    });
  }

  return (
    <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-1 rounded-lg border bg-card/95 px-2 py-1.5 shadow-lg backdrop-blur sm:bottom-6 sm:left-4 sm:top-auto sm:translate-x-0">
      <button
        onClick={() => setZoom(camera.zoom - 0.1)}
        aria-label="Zoom out"
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Minus className="h-4 w-4" />
      </button>
      <button
        onClick={resetZoom}
        className="min-w-[3.5rem] rounded-md px-2 py-1 text-center text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        {Math.round(camera.zoom * 100)}%
      </button>
      <button
        onClick={() => setZoom(camera.zoom + 0.1)}
        aria-label="Zoom in"
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
      </button>
      <div className="mx-1 h-4 w-px bg-border" />
      <button
        onClick={fitToScreen}
        aria-label="Fit to screen"
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Maximize className="h-4 w-4" />
      </button>
    </div>
  );
}
