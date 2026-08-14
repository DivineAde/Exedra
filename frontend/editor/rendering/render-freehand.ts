import type { FreehandElement } from "@whiteboard/editor-core";
import { drawPolyline } from "./render-line";

export function renderFreehand(ctx: CanvasRenderingContext2D, el: FreehandElement) {
  drawPolyline(ctx, el);
}
