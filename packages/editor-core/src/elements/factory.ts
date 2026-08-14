import { nanoid } from "nanoid";
import type {
  ArrowElement,
  BoardElement,
  DiamondElement,
  EllipseElement,
  ElementType,
  FreehandElement,
  LineElement,
  RectangleElement,
  TextElement,
} from "./types";

const DEFAULT_STYLE = {
  strokeColor: "#1e1e1e",
  backgroundColor: "transparent",
  strokeWidth: 2,
  strokeStyle: "solid" as const,
  fillStyle: "solid" as const,
  opacity: 100,
  sloppiness: "normal" as const,
  edges: "rounded" as const,
};

function baseFields() {
  const now = Date.now();
  return {
    id: nanoid(12),
    rotation: 0,
    locked: false,
    seed: Math.floor(Math.random() * 2 ** 31),
    createdAt: now,
    updatedAt: now,
    ...DEFAULT_STYLE,
  };
}

export function createRectangle(x: number, y: number): RectangleElement {
  return {
    ...baseFields(),
    type: "rectangle",
    x,
    y,
    width: 0,
    height: 0,
    cornerRadius: 8,
    boundText: null,
  };
}

export function createDiamond(x: number, y: number): DiamondElement {
  return {
    ...baseFields(),
    type: "diamond",
    x,
    y,
    width: 0,
    height: 0,
    boundText: null,
  };
}

export function createEllipse(x: number, y: number): EllipseElement {
  return {
    ...baseFields(),
    type: "ellipse",
    x,
    y,
    width: 0,
    height: 0,
    boundText: null,
  };
}

export function createLine(x: number, y: number): LineElement {
  return {
    ...baseFields(),
    type: "line",
    x,
    y,
    width: 0,
    height: 0,
    points: [
      [0, 0],
      [0, 0],
    ],
  };
}

export function createArrow(x: number, y: number): ArrowElement {
  return {
    ...baseFields(),
    type: "arrow",
    x,
    y,
    width: 0,
    height: 0,
    points: [
      [0, 0],
      [0, 0],
    ],
    startArrowhead: "none",
    endArrowhead: "arrow",
  };
}

export function createFreehand(x: number, y: number): FreehandElement {
  return {
    ...baseFields(),
    type: "freehand",
    x,
    y,
    width: 0,
    height: 0,
    points: [[0, 0]],
  };
}

export function createText(x: number, y: number, text = ""): TextElement {
  return {
    ...baseFields(),
    type: "text",
    x,
    y,
    width: 100,
    height: 32,
    text,
    fontSize: 20,
    fontFamily: "sans",
    textAlign: "left",
    lineHeight: 1.25,
  };
}

export function createElementByType(
  type: Exclude<ElementType, "image">,
  x: number,
  y: number
): BoardElement {
  switch (type) {
    case "rectangle":
      return createRectangle(x, y);
    case "diamond":
      return createDiamond(x, y);
    case "ellipse":
      return createEllipse(x, y);
    case "line":
      return createLine(x, y);
    case "arrow":
      return createArrow(x, y);
    case "freehand":
      return createFreehand(x, y);
    case "text":
      return createText(x, y);
  }
}
