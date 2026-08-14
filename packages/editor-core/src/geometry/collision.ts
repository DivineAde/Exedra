import type { BoardElement } from "../elements/types";
import { getElementBounds, type Bounds } from "./bounds";

export function pointInBounds(px: number, py: number, b: Bounds): boolean {
  return px >= b.minX && px <= b.maxX && py >= b.minY && py <= b.maxY;
}

const HIT_PADDING = 6;

/** Hit-test a point against an element. Uses a padded bounding box for
 * simplicity; shape-accurate hit testing (e.g. ellipse formula, line
 * distance) is used for thin shapes to keep selection feeling precise. */
export function hitTestElement(
  px: number,
  py: number,
  el: BoardElement
): boolean {
  const b = getElementBounds(el);
  const padded: Bounds = {
    minX: b.minX - HIT_PADDING,
    minY: b.minY - HIT_PADDING,
    maxX: b.maxX + HIT_PADDING,
    maxY: b.maxY + HIT_PADDING,
  };
  if (!pointInBounds(px, py, padded)) return false;

  if (el.type === "rectangle" || el.type === "image" || el.type === "text") {
    return true;
  }

  if (el.type === "diamond") {
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    const halfW = Math.abs(el.width / 2) + HIT_PADDING;
    const halfH = Math.abs(el.height / 2) + HIT_PADDING;
    if (halfW === 0 || halfH === 0) return true;
    // Diamond (rotated square) membership test: |dx|/halfW + |dy|/halfH <= 1
    return Math.abs(px - cx) / halfW + Math.abs(py - cy) / halfH <= 1;
  }

  if (el.type === "ellipse") {
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    const rx = Math.abs(el.width / 2) + HIT_PADDING;
    const ry = Math.abs(el.height / 2) + HIT_PADDING;
    if (rx === 0 || ry === 0) return true;
    const dx = (px - cx) / rx;
    const dy = (py - cy) / ry;
    return dx * dx + dy * dy <= 1;
  }

  // line / arrow / freehand: distance from point to any segment
  if (el.type === "line" || el.type === "arrow" || el.type === "freehand") {
    const abs = el.points.map(([x, y]) => [el.x + x, el.y + y] as const);
    for (let i = 0; i < abs.length - 1; i++) {
      const seg0 = abs[i];
      const seg1 = abs[i + 1];
      if (!seg0 || !seg1) continue;
      if (distanceToSegment(px, py, seg0[0], seg0[1], seg1[0], seg1[1]) <= HIT_PADDING) {
        return true;
      }
    }
    return false;
  }

  return true;
}

function distanceToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;
  let t = lengthSq === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

/** Does the element intersect a drag-selection rectangle (in world space)? */
export function elementIntersectsRect(el: BoardElement, rect: Bounds): boolean {
  const b = getElementBounds(el);
  return !(
    b.maxX < rect.minX ||
    b.minX > rect.maxX ||
    b.maxY < rect.minY ||
    b.minY > rect.maxY
  );
}
