"use client";

import { Undo2, Redo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useEditorStore } from "@/stores/editor-store";
import { modifierKeyLabel } from "@/lib/utils";

/** History (undo/redo availability) lives inside a plain HistoryManager
 * instance rather than reactive Zustand state, so we subscribe to the
 * document version as a proxy signal to re-render these buttons whenever
 * the stack could have changed. */
export function UndoRedoControls() {
  const { undo, redo, history } = useEditorStore();
  const version = useEditorStore((s) => s.document.version);
  const mod = modifierKeyLabel();

  const canUndo = history.canUndo();
  const canRedo = history.canRedo();
  // `version` is read only to force a re-render on every document change;
  // referencing it here keeps the above two calls from going stale.
  void version;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-0.5 rounded-md border bg-background p-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!canUndo} onClick={undo} aria-label="Undo">
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Undo <span className="ml-1 text-muted-foreground">{mod}Z</span>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!canRedo} onClick={redo} aria-label="Redo">
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Redo <span className="ml-1 text-muted-foreground">{mod}⇧Z</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
