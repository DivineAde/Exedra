import type { BoardElement } from "../elements/types";

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Computes an element's bounding box.
 *
 * Path-based elements (line/arrow/freehand) are handled specially: their
 * `points` array can extend in any direction from the element's anchor
 * (el.x, el.y), not just diagonally toward one corner the way a
 * rectangle's width/height does. Deriving bounds from the actual points
 * -- rather than from `width`/`height`, which the drawing interaction
 * only ever sets for box-like shapes -- is what makes hit-testing (used
 * by selection, marquee-select, and the eraser) work along the entire
 * length of a line/arrow/freehand stroke instead of only near its start.
 */
export function getElementBounds(el: BoardElement): Bounds {
  if (el.type === "line" || el.type === "arrow" || el.type === "freehand") {
    if (el.points.length === 0) {
      return { minX: el.x, minY: el.y, maxX: el.x, maxY: el.y };
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const [px, py] of el.points) {
      const ax = el.x + px;
      const ay = el.y + py;
      if (ax < minX) minX = ax;
      if (ax > maxX) maxX = ax;
      if (ay < minY) minY = ay;
      if (ay > maxY) maxY = ay;
    }
    return { minX, minY, maxX, maxY };
  }

  const x2 = el.x + el.width;
  const y2 = el.y + el.height;
  return {
    minX: Math.min(el.x, x2),
    minY: Math.min(el.y, y2),
    maxX: Math.max(el.x, x2),
    maxY: Math.max(el.y, y2),
  };
}

export function mergeBounds(a: Bounds, b: Bounds): Bounds {
  return {
    minX: Math.min(a.minX, b.minX),
    minY: Math.min(a.minY, b.minY),
    maxX: Math.max(a.maxX, b.maxX),
    maxY: Math.max(a.maxY, b.maxY),
  };
}

export function getElementsBounds(elements: BoardElement[]): Bounds | null {
  if (elements.length === 0) return null;
  return elements
    .map(getElementBounds)
    .reduce((acc, b) => (acc ? mergeBounds(acc, b) : b), null as Bounds | null);
}

export function boundsWidth(b: Bounds): number {
  return b.maxX - b.minX;
}

export function boundsHeight(b: Bounds): number {
  return b.maxY - b.minY;
}
