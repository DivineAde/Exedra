"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { useUiStore } from "@/stores/ui-store";
import { getLocalBoard, saveLocalBoard, createEmptyLocalBoard } from "@/lib/local-board-store";
import { AUTOSAVE_DEBOUNCE_MS } from "@/lib/constants";

const GUEST_BOARD_ID = "guest-local-board";

/** Loads (or creates) the guest's local board from IndexedDB on mount, then
 * debounced-persists it back to IndexedDB on every document change -- the
 * guest equivalent of useAutosave, but writing to the browser instead of
 * the backend. No network requests happen for an unauthenticated visitor. */
export function useGuestBoard() {
  const { document, loadDocument } = useEditorStore();
  const { setSaveStatus } = useUiStore();
  const [name, setName] = useState("Untitled board");
  const [ready, setReady] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastSavedVersion = useRef<number>(-1);

  useEffect(() => {
    let cancelled = false;
    getLocalBoard().then((local) => {
      if (cancelled) return;
      const board = local ?? createEmptyLocalBoard();
      setName(board.name);
      loadDocument(GUEST_BOARD_ID, board.document);
      lastSavedVersion.current = board.document.version;
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || document.version === lastSavedVersion.current) return;
    setSaveStatus("saving");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      await saveLocalBoard({ name, document, updatedAt: Date.now() });
      lastSavedVersion.current = document.version;
      setSaveStatus("saved");
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [document, name, ready, setSaveStatus]);

  return { ready, name, setName };
}
