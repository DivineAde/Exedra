import type { TextElement, FontFamily } from "@whiteboard/editor-core";

const FONT_STACKS: Record<FontFamily, string> = {
  sans: "Inter, system-ui, sans-serif",
  serif: "Georgia, serif",
  mono: "'JetBrains Mono', monospace",
  hand: "'Kalam', 'Comic Sans MS', cursive",
};

export function renderText(ctx: CanvasRenderingContext2D, el: TextElement) {
  ctx.save();
  ctx.globalAlpha = el.opacity / 100;
  ctx.fillStyle = el.strokeColor;
  ctx.font = `${el.fontSize}px ${FONT_STACKS[el.fontFamily]}`;
  ctx.textAlign = el.textAlign;
  ctx.textBaseline = "top";

  const lines = el.text.split("\n");
  const lineHeightPx = el.fontSize * el.lineHeight;
  const originX = el.textAlign === "center" ? el.x + el.width / 2 : el.textAlign === "right" ? el.x + el.width : el.x;

  lines.forEach((line, i) => {
    ctx.fillText(line, originX, el.y + i * lineHeightPx);
  });
  ctx.restore();
}
