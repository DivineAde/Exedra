"use client";

import { EditorLayout } from "@/components/layout/EditorLayout";
import { GuestEditorHeader } from "@/components/editor/GuestEditorHeader";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { ZoomControls } from "@/components/editor/ZoomControls";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { ExportDialog } from "@/components/dialogs/ExportDialog";
import { KeyboardShortcutsDialog } from "@/components/dialogs/KeyboardShortcutsDialog";
import { FullPageLoading } from "@/components/feedback/LoadingState";
import { useGuestBoard } from "@/hooks/use-guest-board";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useUiStore } from "@/stores/ui-store";
import { useEffect } from "react";

/**
 * Guest-accessible editor -- the whole point of "progressive" auth (see the
 * project brief): draw, undo/redo, zoom/pan, style, and export immediately,
 * with work persisted locally via IndexedDB (see useGuestBoard). No account,
 * no API calls. Signing in later migrates this board into the account
 * (see features/boards/guest-migration.ts, wired into the login/register
 * forms and the Google OAuth callback).
 */
export default function GuestEditorPage() {
  const { ready, name, setName } = useGuestBoard();
  const { setShortcutsDialogOpen } = useUiStore();

  useKeyboardShortcuts();

  useEffect(() => {
    function onShortcutKey(event: KeyboardEvent) {
      if (event.key === "?" && event.shiftKey) setShortcutsDialogOpen(true);
    }
    window.addEventListener("keydown", onShortcutKey);
    return () => window.removeEventListener("keydown", onShortcutKey);
  }, [setShortcutsDialogOpen]);

  if (!ready) return <FullPageLoading />;

  return (
    <EditorLayout>
      <GuestEditorHeader name={name} onNameChange={setName} />
      <div className="relative flex-1">
        <EditorToolbar />
        <EditorCanvas />
        <ZoomControls />
        <PropertiesPanel />
      </div>
      <ExportDialog boardName={name} />
      <KeyboardShortcutsDialog />
    </EditorLayout>
  );
}
