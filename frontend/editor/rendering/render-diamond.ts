import type { DiamondElement } from "@whiteboard/editor-core";
import { applyStrokeStyle, renderBoundText } from "./stroke-style";

export function renderDiamond(ctx: CanvasRenderingContext2D, el: DiamondElement) {
  const { x, y, width, height, strokeColor, backgroundColor, strokeWidth, strokeStyle, opacity, edges } = el;
  ctx.save();
  ctx.globalAlpha = opacity / 100;
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = backgroundColor;
  applyStrokeStyle(ctx, strokeStyle, strokeWidth);

  const left = Math.min(x, x + width);
  const top = Math.min(y, y + height);
  const w = Math.abs(width);
  const h = Math.abs(height);
  const cx = left + w / 2;
  const cy = top + h / 2;
  // "Rounded" edges on a diamond means rounding the four corner joins
  // slightly rather than a hard point -- approximated with quadratic curves.
  const round = edges === "rounded" ? Math.min(w, h) * 0.08 : 0;

  const top_ = { x: cx, y: top };
  const right = { x: left + w, y: cy };
  const bottom = { x: cx, y: top + h };
  const left_ = { x: left, y: cy };

  ctx.beginPath();
  if (round === 0) {
    ctx.moveTo(top_.x, top_.y);
    ctx.lineTo(right.x, right.y);
    ctx.lineTo(bottom.x, bottom.y);
    ctx.lineTo(left_.x, left_.y);
    ctx.closePath();
  } else {
    const pts = [top_, right, bottom, left_];
    ctx.moveTo((pts[0].x + pts[3].x) / 2, (pts[0].y + pts[3].y) / 2);
    for (let i = 0; i < 4; i++) {
      const cur = pts[i];
      const next = pts[(i + 1) % 4];
      ctx.quadraticCurveTo(cur.x, cur.y, (cur.x + next.x) / 2, (cur.y + next.y) / 2);
    }
    ctx.closePath();
  }

  if (backgroundColor !== "transparent") ctx.fill();
  ctx.stroke();
  ctx.restore();

  renderBoundText(ctx, { x: left, y: top, width: w, height: h }, el.boundText, strokeColor, opacity);
}
