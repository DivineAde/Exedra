import type { ArrowElement } from "@whiteboard/editor-core";
import { drawPolyline } from "./render-line";

export function renderArrow(ctx: CanvasRenderingContext2D, el: ArrowElement) {
  drawPolyline(ctx, el);
  if (el.points.length < 2) return;

  const last = el.points[el.points.length - 1]!;
  const secondLast = el.points[el.points.length - 2]!;
  const tipX = el.x + last[0];
  const tipY = el.y + last[1];
  const angle = Math.atan2(tipY - (el.y + secondLast[1]), tipX - (el.x + secondLast[0]));

  if (el.endArrowhead === "arrow") {
    drawArrowhead(ctx, tipX, tipY, angle, el.strokeColor, el.strokeWidth, el.opacity);
  }

  if (el.startArrowhead === "arrow") {
    const first = el.points[0]!;
    const second = el.points[1]!;
    const startX = el.x + first[0];
    const startY = el.y + first[1];
    const startAngle = Math.atan2(startY - (el.y + second[1]), startX - (el.x + second[0]));
    drawArrowhead(ctx, startX, startY, startAngle, el.strokeColor, el.strokeWidth, el.opacity);
  }
}

function drawArrowhead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  color: string,
  strokeWidth: number,
  opacity: number
) {
  const size = 8 + strokeWidth * 2;
  ctx.save();
  ctx.globalAlpha = opacity / 100;
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - size * Math.cos(angle - Math.PI / 6), y - size * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x, y);
  ctx.lineTo(x - size * Math.cos(angle + Math.PI / 6), y - size * Math.sin(angle + Math.PI / 6));
  ctx.stroke();
  ctx.restore();
}
