"use client";

import { useEffect, useRef } from "react";
import { worldToScreen, type Camera } from "@whiteboard/editor-core";
import { useEditorStore } from "@/stores/editor-store";
import type { TextEditSession } from "@/hooks/use-text-editing";

interface TextEditorOverlayProps {
  session: TextEditSession;
  camera: Camera;
  onCommit: (text: string) => void;
  onCancel: () => void;
}

/** A plain HTML <textarea>, absolutely positioned over the canvas to line
 * up with the element/shape being edited. This is the standard technique
 * for in-place canvas text editing (native text input/IME/selection all
 * work correctly, which a canvas-drawn caret can't replicate). It commits
 * on blur or Escape and is removed the moment editing ends -- the actual
 * text is only ever drawn by the canvas renderer once committed. */
export function TextEditorOverlay({ session, camera, onCommit, onCancel }: TextEditorOverlayProps) {
  const document = useEditorStore((s) => s.document);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const element = document.elements.find((e) => e.id === session.elementId);

  useEffect(() => {
  const raf = requestAnimationFrame(() => {
    textareaRef.current?.focus();
    textareaRef.current?.select();
  });
  return () => cancelAnimationFrame(raf);
}, []);

  if (!element) return null;

  let screenX: number, screenY: number, width: number, fontSize: number, textAlign: "left" | "center" | "right";

  if (session.mode === "standalone" && element.type === "text") {
    const topLeft = worldToScreen(element.x, element.y, camera);
    screenX = topLeft.x;
    screenY = topLeft.y;
    width = Math.max(element.width, 120) * camera.zoom;
    fontSize = element.fontSize * camera.zoom;
    textAlign = element.textAlign;
  } else {
    // Bound text: center the editor over the shape's bounding box.
    const left = Math.min(element.x, element.x + element.width);
    const top = Math.min(element.y, element.y + element.height);
    const topLeft = worldToScreen(left, top, camera);
    screenX = topLeft.x;
    screenY = topLeft.y + (Math.abs(element.height) * camera.zoom) / 2 - 14;
    width = Math.abs(element.width) * camera.zoom;
    fontSize = 18 * camera.zoom;
    textAlign = "center";
  }

  return (
    <textarea
      ref={textareaRef}
      defaultValue={session.initialText}
      onBlur={(e) => onCommit(e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
          e.currentTarget.blur();
        }
        // Enter commits for bound (single-line-ish) labels; standalone
        // text elements allow multi-line via Shift+Enter or plain Enter.
        if (e.key === "Enter" && session.mode === "bound" && !e.shiftKey) {
          e.preventDefault();
          onCommit(e.currentTarget.value);
          e.currentTarget.blur();
        }
      }}
      style={{
        position: "absolute",
        left: screenX,
        top: screenY,
        width,
        fontSize,
        textAlign,
        lineHeight: 1.25,
        fontFamily: "var(--font-sans), Inter, system-ui, sans-serif",
        background: "transparent",
        border: "1px dashed hsl(var(--primary))",
        outline: "none",
        resize: "none",
        color: "hsl(var(--foreground))",
        padding: 2,
        minHeight: fontSize * 1.5,
        zIndex: 30,
      }}
      className="overflow-hidden"
    />
  );
}
