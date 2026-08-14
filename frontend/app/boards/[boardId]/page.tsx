"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { EditorLayout } from "@/components/layout/EditorLayout";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { ZoomControls } from "@/components/editor/ZoomControls";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { ShareBoardDialog } from "@/components/dialogs/ShareBoardDialog";
import { ExportDialog } from "@/components/dialogs/ExportDialog";
import { KeyboardShortcutsDialog } from "@/components/dialogs/KeyboardShortcutsDialog";
import { FullPageLoading } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useBoard } from "@/features/boards/use-board";
import { useEditorStore } from "@/stores/editor-store";
import { useUiStore } from "@/stores/ui-store";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useAutosave } from "@/hooks/use-autosave";
import { useCollaboration } from "@/hooks/use-collaboration";
import { CURSOR_THROTTLE_MS } from "@/lib/constants";

export default function BoardPage() {
  const params = useParams<{ boardId: string }>();
  const boardId = params.boardId;
  const { data: board, isLoading, isError, refetch } = useBoard(boardId);
  const { loadDocument } = useEditorStore();
  const { setShortcutsDialogOpen } = useUiStore();
  const [wsToken, setWsToken] = useState<string | null>(null);

  useEffect(() => {
    setWsToken(window.localStorage.getItem("whiteboard_ws_token"));
  }, []);

  useEffect(() => {
    if (board) loadDocument(board.id, board.document);
  }, [board, loadDocument]);

  useKeyboardShortcuts();
  useAutosave(boardId, board?.version ?? null);
  const socketRef = useCollaboration(boardId, wsToken);

  useEffect(() => {
    function onShortcutKey(event: KeyboardEvent) {
      if (event.key === "?" && event.shiftKey) setShortcutsDialogOpen(true);
    }
    window.addEventListener("keydown", onShortcutKey);
    return () => window.removeEventListener("keydown", onShortcutKey);
  }, [setShortcutsDialogOpen]);

  let lastCursorSend = 0;
  function handleCursorMove(worldX: number, worldY: number) {
    const now = Date.now();
    if (now - lastCursorSend < CURSOR_THROTTLE_MS) return;
    lastCursorSend = now;
    socketRef.current?.send({ type: "cursor:update", boardId, x: worldX, y: worldY });
  }

  if (isLoading) return <FullPageLoading />;

  if (isError || !board) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ErrorState message="This board doesn't exist, or you don't have access to it." onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <EditorLayout>
      <EditorHeader boardId={board.id} initialName={board.name} />
      <div className="relative flex-1">
        <EditorToolbar />
        <EditorCanvas onCursorMove={handleCursorMove} />
        <ZoomControls />
        <PropertiesPanel />
      </div>
      <ShareBoardDialog boardId={board.id} />
      <ExportDialog boardName={board.name} />
      <KeyboardShortcutsDialog />
    </EditorLayout>
  );
}
