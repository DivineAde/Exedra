import type { RectangleElement } from "@whiteboard/editor-core";import { applyStrokeStyle, renderBoundText } from "./stroke-style";

export function renderRectangle(ctx: CanvasRenderingContext2D, el: RectangleElement) {
  const { x, y, width, height, cornerRadius, strokeColor, backgroundColor, strokeWidth, strokeStyle, opacity, edges } = el;
  ctx.save();
  ctx.globalAlpha = opacity / 100;
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = backgroundColor;
  applyStrokeStyle(ctx, strokeStyle, strokeWidth);

  const w = Math.abs(width);
  const h = Math.abs(height);
  const rx = edges === "sharp" ? 0 : Math.min(cornerRadius, w / 2, h / 2);
  const left = Math.min(x, x + width);
  const top = Math.min(y, y + height);

  ctx.beginPath();
  ctx.roundRect(left, top, w, h, rx);
  if (backgroundColor !== "transparent") ctx.fill();
  ctx.stroke();
  ctx.restore();

  renderBoundText(ctx, { x: left, y: top, width: w, height: h }, el.boundText, strokeColor, opacity);
}
