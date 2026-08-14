"use client";

import { useCallback, useState } from "react";
import { createText, type BoardElement } from "@whiteboard/editor-core";
import { useEditorStore } from "@/stores/editor-store";
import { useSelectionStore } from "@/stores/selection-store";
import { useUiStore } from "@/stores/ui-store";

export interface TextEditSession {
  /** "standalone" edits a freestanding TextElement; "bound" edits the
   * boundText label centered inside a shape (created via double-click). */
  mode: "standalone" | "bound";
  elementId: string;
  initialText: string;
}

const SHAPE_TYPES = new Set(["rectangle", "diamond", "ellipse"]);

/** Owns the lifecycle of in-place text editing: creating a text element
 * when the Text tool is used, opening a shape's bound-text editor on
 * double-click, and committing/discarding on blur or Escape. The actual
 * on-screen <textarea> lives in <TextEditorOverlay>; this hook only
 * manages *which* element (if any) is currently being edited. */
export function useTextEditing() {
  const { document, createElement, updateElement, deleteElements } = useEditorStore();
  const { select, clearSelection } = useSelectionStore();
  const { setActiveTool } = useUiStore();
  const [session, setSession] = useState<TextEditSession | null>(null);

  const startStandaloneText = useCallback(
    (worldX: number, worldY: number) => {
      const element = createText(worldX, worldY);
      createElement(element);
      setSession({ mode: "standalone", elementId: element.id, initialText: "" });
    },
    [createElement]
  );

  const startBoundTextEdit = useCallback(
    (element: BoardElement) => {
      // Double-clicking an existing standalone text element re-opens it
      // for editing (previously this silently did nothing for text
      // elements -- only shapes were handled).
      if (element.type === "text") {
        select([element.id]);
        setSession({ mode: "standalone", elementId: element.id, initialText: element.text });
        return true;
      }
      if (!SHAPE_TYPES.has(element.type)) return false;
      const boundText = "boundText" in element ? element.boundText : null;
      select([element.id]);
      setSession({ mode: "bound", elementId: element.id, initialText: boundText?.text ?? "" });
      return true;
    },
    [select]
  );

  const commit = useCallback(
    (text: string) => {
      if (!session) return;
      const trimmed = text;

      if (session.mode === "standalone") {
        if (trimmed.trim().length === 0) {
          deleteElements([session.elementId]);
          clearSelection();
        } else {
          updateElement(session.elementId, { text: trimmed } as never);
          select([session.elementId]);
        }
        setActiveTool("select");
      } else {
        const el = document.elements.find((e) => e.id === session.elementId);
        const fontSize = el && "boundText" in el && el.boundText ? el.boundText.fontSize : 18;
        updateElement(session.elementId, {
          boundText:
            trimmed.trim().length === 0
              ? null
              : { text: trimmed, fontSize, fontFamily: "sans", textAlign: "center" },
        } as never);
      }
      setSession(null);
    },
    [session, document.elements, updateElement, deleteElements, clearSelection, select, setActiveTool]
  );

  const cancel = useCallback(() => {
    if (session?.mode === "standalone" && session.initialText.trim().length === 0) {
      deleteElements([session.elementId]);
      clearSelection();
      setActiveTool("select");
    }
    setSession(null);
  }, [session, deleteElements, clearSelection, setActiveTool]);

  return { session, startStandaloneText, startBoundTextEdit, commit, cancel };
}
