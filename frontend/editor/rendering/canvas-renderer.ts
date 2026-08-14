import type { BoardDocument, BoardElement, Camera } from "@whiteboard/editor-core";
import { getElementBounds } from "@whiteboard/editor-core";
import { renderRectangle } from "./render-rectangle";
import { renderDiamond } from "./render-diamond";
import { renderEllipse } from "./render-ellipse";
import { renderLine } from "./render-line";
import { renderArrow } from "./render-arrow";
import { renderFreehand } from "./render-freehand";
import { renderText } from "./render-text";

export interface RenderOptions {
  selectedIds: Set<string>;
  hoveredId: string | null;
  isDarkMode: boolean;
  selectionRect: { x: number; y: number; width: number; height: number } | null;
  /** Element currently being edited via TextEditorOverlay -- its own text/
   * boundText is skipped here so the live HTML textarea is the only thing
   * showing that content while editing is in progress. */
  editingElementId: string | null;
  /** Device pixel ratio. Must be folded into the SAME setTransform call as
   * the camera pan/zoom, not applied as a separate ctx.setTransform() —
   * setTransform() replaces the whole matrix rather than composing with
   * it, so a separate earlier call gets silently wiped out the moment
   * this function sets its own transform. That was the root cause of
   * elements rendering soft/misaligned on any HiDPI display: the world
   * transform below was overwriting the DPR scale entirely. */
  dpr: number;
}

const GRID_SIZE = 24;

/**
 * Draws the full frame: background grid, every element (in z-order),
 * hover/selection outlines, and the marquee selection rectangle.
 * Called from a requestAnimationFrame loop -- never from React state
 * updates directly, so canvas work never triggers a React re-render.
 */
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  camera: Camera,
  document: BoardDocument,
  options: RenderOptions
) {
  const { dpr } = options;
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // The board's chosen background color is part of the persisted document
  // (BoardDocument.backgroundColor) -- paint it here so it's what actually
  // renders, is what gets exported, and is what a screenshot/PNG export
  // shows. Previously this was never painted at all; the canvas just sat
  // on top of the page's CSS theme background, so changing it visibly did
  // nothing.
  ctx.fillStyle = document.backgroundColor || "#ffffff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  drawGrid(ctx, canvasWidth, canvasHeight, camera, options.isDarkMode);

  // World coordinates map to screen via (world - camera) * zoom, composed
  // with the DPR scale set above (multiplied, not replaced).
  ctx.setTransform(
    dpr * camera.zoom, 0, 0, dpr * camera.zoom,
    dpr * -camera.x * camera.zoom, dpr * -camera.y * camera.zoom
  );

  for (const element of document.elements) {
    if (element.id === options.editingElementId && element.type === "text") continue;
    drawElement(ctx, element, options.editingElementId);
    if (options.selectedIds.has(element.id) || options.hoveredId === element.id) {
      drawOutline(ctx, element, options.selectedIds.has(element.id), camera.zoom);
    }
  }

  // Back to plain CSS-pixel (DPR-only) space for screen-space overlays
  // like the marquee rect, which is already pre-converted to screen
  // coordinates by the caller (see marqueeRectToScreen in EditorCanvas).
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (options.selectionRect) {
    drawMarquee(ctx, options.selectionRect);
  }

  ctx.restore();
}

function drawElement(ctx: CanvasRenderingContext2D, element: BoardElement, editingElementId: string | null) {
  const isBeingEdited = element.id === editingElementId;
  switch (element.type) {
    case "rectangle":
      return renderRectangle(ctx, isBeingEdited ? { ...element, boundText: null } : element);
    case "diamond":
      return renderDiamond(ctx, isBeingEdited ? { ...element, boundText: null } : element);
    case "ellipse":
      return renderEllipse(ctx, isBeingEdited ? { ...element, boundText: null } : element);
    case "line":
      return renderLine(ctx, element);
    case "arrow":
      return renderArrow(ctx, element);
    case "freehand":
      return renderFreehand(ctx, element);
    case "text":
      return renderText(ctx, element);
    case "image":
      return; // image drawing handled by an offscreen-cached bitmap layer
  }
}

function drawOutline(ctx: CanvasRenderingContext2D, element: BoardElement, isSelected: boolean, zoom: number) {
  const bounds = getElementBounds(element);
  ctx.save();
  ctx.strokeStyle = isSelected ? "#845ef7" : "#adb5bd";
  // Divide by zoom only (not the full DPR-inclusive transform) so the
  // stroke stays a consistent 1 *CSS* pixel wide -- the canvas backing
  // store's higher physical resolution on HiDPI screens is what makes
  // that 1 CSS pixel render crisply, not a reason to draw it thinner.
  ctx.lineWidth = 1 / (zoom || 1);
  ctx.setLineDash(isSelected ? [] : [4, 4]);
  ctx.strokeRect(
    bounds.minX - 4,
    bounds.minY - 4,
    bounds.maxX - bounds.minX + 8,
    bounds.maxY - bounds.minY + 8
  );
  ctx.restore();
}

function drawMarquee(
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; width: number; height: number }
) {
  ctx.save();
  ctx.fillStyle = "rgba(132, 94, 247, 0.1)";
  ctx.strokeStyle = "#845ef7";
  ctx.lineWidth = 1;
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
  ctx.restore();
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camera: Camera,
  isDarkMode: boolean
) {
  const size = GRID_SIZE * camera.zoom;
  if (size < 6) return; // too dense to render meaningfully when zoomed out

  const offsetX = (-camera.x * camera.zoom) % size;
  const offsetY = (-camera.y * camera.zoom) % size;

  ctx.save();
  ctx.strokeStyle = isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = offsetX; x < width; x += size) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = offsetY; y < height; y += size) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();
  ctx.restore();
}
