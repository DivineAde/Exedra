import type { EllipseElement } from "@whiteboard/editor-core";
import { applyStrokeStyle, renderBoundText } from "./stroke-style";

export function renderEllipse(ctx: CanvasRenderingContext2D, el: EllipseElement) {
  const { x, y, width, height, strokeColor, backgroundColor, strokeWidth, strokeStyle, opacity } = el;
  ctx.save();
  ctx.globalAlpha = opacity / 100;
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = backgroundColor;
  applyStrokeStyle(ctx, strokeStyle, strokeWidth);

  const cx = x + width / 2;
  const cy = y + height / 2;
  const rx = Math.abs(width / 2);
  const ry = Math.abs(height / 2);

  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  if (backgroundColor !== "transparent") ctx.fill();
  ctx.stroke();
  ctx.restore();

  renderBoundText(
    ctx,
    { x: Math.min(x, x + width), y: Math.min(y, y + height), width: Math.abs(width), height: Math.abs(height) },
    el.boundText,
    strokeColor,
    opacity
  );
}
