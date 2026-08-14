/**
 * Core element document model.
 * This module has zero dependency on React and is shared between
 * the frontend renderer and (conceptually) any future backend validation.
 */

export type ElementType =
  | "rectangle"
  | "diamond"
  | "ellipse"
  | "line"
  | "arrow"
  | "freehand"
  | "text"
  | "image";

export type StrokeStyle = "solid" | "dashed" | "dotted";
export type FillStyle = "solid" | "hachure" | "none";
export type FontFamily = "sans" | "serif" | "mono" | "hand";
export type TextAlign = "left" | "center" | "right";
export type ArrowheadStyle = "none" | "arrow" | "dot" | "bar";
export type Sloppiness = "architect" | "artist" | "normal";
export type EdgeStyle = "sharp" | "rounded";

/** A short label rendered centered inside a shape (rectangle/diamond/ellipse),
 * created by double-clicking the shape. Kept as a child of the shape rather
 * than a separate freestanding text element, so it moves/resizes with it. */
export interface BoundText {
  text: string;
  fontSize: number;
  fontFamily: FontFamily;
  textAlign: TextAlign;
}

export interface BaseElement {
  id: string;
  type: ElementType;

  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;

  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  fillStyle: FillStyle;
  opacity: number;

  locked: boolean;
  seed: number;

  sloppiness: Sloppiness;
  edges: EdgeStyle;

  createdAt: number;
  updatedAt: number;
}

export interface RectangleElement extends BaseElement {
  type: "rectangle";
  cornerRadius: number;
  boundText: BoundText | null;
}

export interface DiamondElement extends BaseElement {
  type: "diamond";
  boundText: BoundText | null;
}

export interface EllipseElement extends BaseElement {
  type: "ellipse";
  boundText: BoundText | null;
}

export interface LineElement extends BaseElement {
  type: "line";
  points: Array<[number, number]>;
}

export interface ArrowElement extends BaseElement {
  type: "arrow";
  points: Array<[number, number]>;
  startArrowhead: ArrowheadStyle;
  endArrowhead: ArrowheadStyle;
}

export interface FreehandElement extends BaseElement {
  type: "freehand";
  points: Array<[number, number]>;
}

export interface TextElement extends BaseElement {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: FontFamily;
  textAlign: TextAlign;
  lineHeight: number;
}

export interface ImageElement extends BaseElement {
  type: "image";
  fileUrl: string;
  naturalWidth: number;
  naturalHeight: number;
}

export type BoardElement =
  | RectangleElement
  | DiamondElement
  | EllipseElement
  | LineElement
  | ArrowElement
  | FreehandElement
  | TextElement
  | ImageElement;

export interface BoardDocument {
  elements: BoardElement[];
  backgroundColor: string;
  version: number;
}

export function createEmptyDocument(): BoardDocument {
  return {
    elements: [],
    backgroundColor: "#ffffff",
    version: 0,
  };
}
