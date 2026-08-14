"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { useUiStore } from "@/stores/ui-store";
import { apiClient, ApiError } from "@/services/api-client";
import type { BoardDTO } from "@whiteboard/shared-types";
import { AUTOSAVE_DEBOUNCE_MS } from "@/lib/constants";

/**
 * Debounced autosave with real optimistic-concurrency handling.
 *
 * Two version numbers matter here and they are NOT the same thing:
 *  - `document.version` (from @whiteboard/editor-core) increments on every
 *    local command -- it's an undo/redo bookkeeping counter, private to
 *    this browser tab, and is used below only to detect "did anything
 *    change since the last save attempt".
 *  - `serverVersionRef` tracks the last `Board.version` this client knows
 *    the backend actually has persisted. THIS is what's sent as
 *    `expectedVersion` for optimistic concurrency. Conflating the two
 *    (sending the local edit-counter as if it were the server's save
 *    version) is what previously caused spurious 409s on nearly every
 *    save -- the numbers diverge after the very first edit.
 *
 * Overlapping requests are prevented with an in-flight guard: if a save
 * is already in progress when the debounce timer fires again, we don't
 * start a second PATCH -- we just remember that more changes arrived and
 * kick off exactly one more save immediately after the in-flight one
 * resolves, using whatever the document looks like *then* (which already
 * includes any WebSocket-applied remote edits merged in). This keeps at
 * most one save in flight and one queued, never more.
 */
export function useAutosave(boardId: string, initialServerVersion: number | null) {
  const { setSaveStatus } = useUiStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const serverVersionRef = useRef<number>(0);
  const hasHydratedRef = useRef(false);
  const lastAttemptedLocalVersion = useRef<number>(-1);
  const isSavingRef = useRef(false);
  const pendingRef = useRef(false);
  const isOnlineRef = useRef(true);

  // `initialServerVersion` starts out `null` while the board is still
  // loading (see the board page's `useBoard` query) and only becomes a
  // real number once. Hydrate exactly once, the first time we actually
  // have it -- not on `boardId` alone, which would fire before the data
  // arrives and permanently lock in a wrong fallback version; and not on
  // every render after that either, which would stomp on
  // `serverVersionRef` after it's already been correctly advanced by a
  // real save.
  useEffect(() => {
    if (hasHydratedRef.current || initialServerVersion === null) return;
    serverVersionRef.current = initialServerVersion;
    // Also baseline the "last known" local version to whatever the
    // document is right now (the state that was just loaded from the
    // server), so opening a board doesn't immediately fire a redundant
    // "saving..." for content that hasn't actually changed yet.
    lastAttemptedLocalVersion.current = useEditorStore.getState().document.version;
    hasHydratedRef.current = true;
  }, [initialServerVersion]);

  useEffect(() => {
    hasHydratedRef.current = false;
    lastAttemptedLocalVersion.current = -1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  useEffect(() => {
    function handleOnline() {
      isOnlineRef.current = true;
      scheduleSave(0);
    }
    function handleOffline() {
      isOnlineRef.current = false;
      setSaveStatus("offline");
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function performSave() {
    if (isSavingRef.current) {
      pendingRef.current = true;
      return;
    }
    if (!isOnlineRef.current) {
      setSaveStatus("offline");
      return;
    }

    isSavingRef.current = true;
    setSaveStatus("saving");

    // Bounded retry loop (not recursion): one real attempt, plus one
    // automatic retry if -- and only if -- the server tells us our version
    // was stale (409). Using a loop here instead of calling performSave()
    // again from inside the catch block matters: a recursive call would
    // run its own `finally` on top of this one, so the "flush a queued
    // save" check below could fire twice for a single round of edits.
    const maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const { document } = useEditorStore.getState();
      lastAttemptedLocalVersion.current = document.version;

      try {
        const saved = await apiClient.patch<BoardDTO>(`/api/boards/${boardId}`, {
          document,
          expectedVersion: serverVersionRef.current,
        });
        serverVersionRef.current = saved.version;
        setSaveStatus("saved");
        break;
      } catch (err) {
        const isStaleVersionConflict = err instanceof ApiError && err.status === 409;
        if (isStaleVersionConflict && attempt < maxAttempts) {
          // Resync to the real current version the backend just told us
          // about (no extra round trip needed -- it's in the 409 body)
          // and retry with the latest local document. Since live
          // collaboration already merges remote edits into this client's
          // local document via WebSocket as they arrive, this retry is
          // not blindly clobbering anyone else's changes -- it's
          // re-sending the same convergent state under the correct
          // version number.
          const details = (err as ApiError).details as { currentVersion?: number } | undefined;
          if (typeof details?.currentVersion === "number") {
            serverVersionRef.current = details.currentVersion;
          }
          continue;
        }
        setSaveStatus("error");
        break;
      }
    }

    isSavingRef.current = false;
    if (pendingRef.current) {
      pendingRef.current = false;
      // More edits arrived while this save was in flight -- save again
      // immediately rather than waiting out a fresh debounce window.
      void performSave();
    }
  }

  function scheduleSave(delay: number) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => void performSave(), delay);
  }

  const document = useEditorStore((s) => s.document);

  useEffect(() => {
    if (document.version === lastAttemptedLocalVersion.current) return;
    if (!isOnlineRef.current) {
      setSaveStatus("offline");
      return;
    }
    setSaveStatus("saving");
    scheduleSave(AUTOSAVE_DEBOUNCE_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document]);
}
