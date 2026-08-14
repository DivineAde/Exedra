import type { BoardElement } from "../elements/types";

export function moveElement(el: BoardElement, dx: number, dy: number): BoardElement {
  return { ...el, x: el.x + dx, y: el.y + dy, updatedAt: Date.now() };
}

export type ResizeHandle =
  | "n" | "s" | "e" | "w"
  | "ne" | "nw" | "se" | "sw";

/** Resize an element by dragging a handle, keeping the opposite edge fixed. */
export function resizeElement(
  el: BoardElement,
  handle: ResizeHandle,
  dx: number,
  dy: number
): BoardElement {
  let { x, y, width, height } = el;

  if (handle.includes("e")) width += dx;
  if (handle.includes("s")) height += dy;
  if (handle.includes("w")) {
    x += dx;
    width -= dx;
  }
  if (handle.includes("n")) {
    y += dy;
    height -= dy;
  }

  return { ...el, x, y, width, height, updatedAt: Date.now() };
}
