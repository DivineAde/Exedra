import type { LineElement } from "@whiteboard/editor-core";
import { applyStrokeStyle } from "./stroke-style";

export function renderLine(ctx: CanvasRenderingContext2D, el: LineElement) {
  drawPolyline(ctx, el);
}

export function drawPolyline(
  ctx: CanvasRenderingContext2D,
  el: {
    x: number;
    y: number;
    points: Array<[number, number]>;
    strokeColor: string;
    strokeWidth: number;
    strokeStyle: import("@whiteboard/editor-core").StrokeStyle;
    opacity: number;
  }
) {
  if (el.points.length < 2) return;
  ctx.save();
  ctx.globalAlpha = el.opacity / 100;
  ctx.strokeStyle = el.strokeColor;
  ctx.lineWidth = el.strokeWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  applyStrokeStyle(ctx, el.strokeStyle, el.strokeWidth);

  ctx.beginPath();
  const [firstX, firstY] = el.points[0]!;
  ctx.moveTo(el.x + firstX, el.y + firstY);
  for (const [px, py] of el.points.slice(1)) {
    ctx.lineTo(el.x + px, el.y + py);
  }
  ctx.stroke();
  ctx.restore();
}
