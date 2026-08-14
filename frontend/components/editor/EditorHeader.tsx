"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ArrowLeft, Share2, Download, PenTool, MoreVertical, Keyboard, Palette, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { UserMenu } from "@/components/navigation/UserMenu";
import { SaveStatus } from "./SaveStatus";
import { CollaboratorAvatars } from "./CollaboratorAvatars";
import { UndoRedoControls } from "./UndoRedoControls";
import { BackgroundControl } from "./BackgroundControl";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useUiStore } from "@/stores/ui-store";
import { useRenameBoard } from "@/features/boards/use-boards";

export function EditorHeader({ boardId, initialName }: { boardId: string; initialName: string }) {
  const [name, setName] = useState(initialName);
  const [editing, setEditing] = useState(false);
  const { setShareDialogOpen, setExportDialogOpen, setShortcutsDialogOpen } = useUiStore();
  const { setTheme } = useTheme();
  const renameBoard = useRenameBoard();

  function commitName() {
    setEditing(false);
    if (name.trim() && name !== initialName) {
      renameBoard.mutate({ boardId, name: name.trim() });
    }
  }

  return (
    <header className="flex h-14 items-center justify-between gap-2 border-b bg-card px-3 sm:gap-4 sm:px-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard" aria-label="Back to dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PenTool className="hidden h-4 w-4 text-primary sm:block" />
        {editing ? (
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => e.key === "Enter" && commitName()}
            className="h-8 w-36 sm:w-48"
          />
        ) : (
          <button onClick={() => setEditing(true)} className="truncate rounded px-1.5 py-0.5 text-sm font-medium hover:bg-muted">
            {name}
          </button>
        )}
      </div>

      {/* Desktop: every control visible inline. */}
      <div className="hidden items-center gap-3 sm:flex">
        <SaveStatus />
        <CollaboratorAvatars />
        <UndoRedoControls />
        <BackgroundControl />
        <Button variant="outline" size="sm" onClick={() => setShareDialogOpen(true)}>
          <Share2 className="h-4 w-4" /> Share
        </Button>
        <Button variant="outline" size="sm" onClick={() => setExportDialogOpen(true)}>
          <Download className="h-4 w-4" /> Export
        </Button>
        <ThemeToggle />
        <UserMenu />
      </div>

      {/* Mobile: only Undo/Redo, Share, and an overflow menu stay visible
          inline -- everything else (Export, Background, Keyboard shortcuts,
          Theme, Save status, Collaborators) moves into the "⋮" menu, per
          the "[☰] Board name [Share] [⋮]" layout. */}
      <div className="flex items-center gap-1.5 sm:hidden">
        <UndoRedoControls />
        <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setShareDialogOpen(true)} aria-label="Share">
          <Share2 className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="More options">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="flex items-center justify-between px-2 py-1.5">
              <SaveStatus />
              <CollaboratorAvatars />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
              <Download className="mr-2 h-4 w-4" /> Export
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShortcutsDialogOpen(true)}>
              <Keyboard className="mr-2 h-4 w-4" /> Keyboard shortcuts
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Palette className="h-3.5 w-3.5" /> Background
              </p>
              <BackgroundControl />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="mr-2 h-4 w-4" /> System
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-2 py-1">
              <UserMenu />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
