export const TOOL_SHORTCUTS = {
  select: "v",
  hand: "h",
  rectangle: "r",
  diamond: "d",
  ellipse: "o",
  line: "l",
  arrow: "a",
  freehand: "p",
  text: "t",
  eraser: "e",
} as const;

export const DEFAULT_STROKE_COLORS = [
  "#1e1e1e",
  "#e03131",
  "#2f9e44",
  "#1971c2",
  "#f08c00",
];

export const DEFAULT_BACKGROUND_COLORS = [
  "transparent",
  "#ffc9c9",
  "#b2f2bb",
  "#a5d8ff",
  "#ffec99",
];

export const AUTOSAVE_DEBOUNCE_MS = 800;
export const CURSOR_THROTTLE_MS = 33;
