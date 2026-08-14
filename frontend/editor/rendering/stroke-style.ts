import type { StrokeStyle } from "@whiteboard/editor-core";

/** Applies the dash pattern for a given stroke style. Scales with stroke
 * width so thicker strokes don't get a busy, cramped dash pattern. */
export function applyStrokeStyle(ctx: CanvasRenderingContext2D, style: StrokeStyle, strokeWidth: number) {
  if (style === "dashed") {
    ctx.setLineDash([strokeWidth * 4, strokeWidth * 3]);
  } else if (style === "dotted") {
    ctx.setLineDash([strokeWidth * 1, strokeWidth * 2.5]);
    ctx.lineCap = "round";
  } else {
    ctx.setLineDash([]);
  }
}

/** Renders any `boundText` centered inside a shape's bounds (see
 * BoundText in @whiteboard/editor-core). Shared by rectangle/diamond/ellipse. */
export function renderBoundText(
  ctx: CanvasRenderingContext2D,
  bounds: { x: number; y: number; width: number; height: number },
  boundText: { text: string; fontSize: number; fontFamily: string; textAlign: string } | null | undefined,
  strokeColor: string,
  opacity: number
) {
  if (!boundText || !boundText.text) return;
  const FONT_STACKS: Record<string, string> = {
    sans: "Inter, system-ui, sans-serif",
    serif: "Georgia, serif",
    mono: "'JetBrains Mono', monospace",
    hand: "'Kalam', 'Comic Sans MS', cursive",
  };

  ctx.save();
  ctx.globalAlpha = opacity / 100;
  ctx.fillStyle = strokeColor;
  ctx.font = `${boundText.fontSize}px ${FONT_STACKS[boundText.fontFamily] ?? FONT_STACKS.sans}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const cx = bounds.x + bounds.width / 2;
  const cy = bounds.y + bounds.height / 2;
  const maxWidth = Math.abs(bounds.width) - 16;
  const lines = wrapText(ctx, boundText.text, maxWidth);
  const lineHeight = boundText.fontSize * 1.25;
  const startY = cy - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, i) => ctx.fillText(line, cx, startY + i * lineHeight));
  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (maxWidth <= 0) return text.split("\n");
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(" ");
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (ctx.measureText(candidate).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    lines.push(current);
  }
  return lines;
}
