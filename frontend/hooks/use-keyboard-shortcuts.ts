"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { useSelectionStore } from "@/stores/selection-store";
import { useUiStore, type ToolType } from "@/stores/ui-store";
import { TOOL_SHORTCUTS } from "@/lib/constants";

const SHORTCUT_TO_TOOL = Object.fromEntries(
  Object.entries(TOOL_SHORTCUTS).map(([tool, key]) => [key, tool as ToolType])
);

/** Global keyboard shortcuts for the editor. Uses `event.metaKey || event.ctrlKey`
 * so shortcuts work correctly on both macOS and Windows/Linux. */
export function useKeyboardShortcuts() {
  const { deleteElements, duplicateElements, copySelection, pasteClipboard, undo, redo } =
    useEditorStore();
  const { selectedIds, clearSelection, select } = useSelectionStore();
  const { setActiveTool } = useUiStore();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if (isTyping) return;

      const mod = event.metaKey || event.ctrlKey;

      if (mod && event.key.toLowerCase() === "z" && event.shiftKey) {
        event.preventDefault();
        redo();
        return;
      }
      if (mod && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undo();
        return;
      }
      if (mod && event.key.toLowerCase() === "d") {
        event.preventDefault();
        if (selectedIds.length) select(duplicateElements(selectedIds));
        return;
      }
      if (mod && event.key.toLowerCase() === "c") {
        if (selectedIds.length) copySelection(selectedIds);
        return;
      }
      if (mod && event.key.toLowerCase() === "v") {
        const newIds = pasteClipboard();
        if (newIds.length) select(newIds);
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedIds.length) {
          event.preventDefault();
          deleteElements(selectedIds);
          clearSelection();
        }
        return;
      }

      if (event.key === "Escape") {
        clearSelection();
        setActiveTool("select");
        return;
      }

      const tool = SHORTCUT_TO_TOOL[event.key.toLowerCase()];
      if (tool && !mod) {
        setActiveTool(tool);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIds, deleteElements, duplicateElements, copySelection, pasteClipboard, undo, redo, clearSelection, select, setActiveTool]);
}
