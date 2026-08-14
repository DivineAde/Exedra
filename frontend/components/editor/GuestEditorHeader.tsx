"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Download, PenTool, LogIn, MoreVertical, Keyboard, Palette, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SaveStatus } from "./SaveStatus";
import { UndoRedoControls } from "./UndoRedoControls";
import { BackgroundControl } from "./BackgroundControl";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useUiStore } from "@/stores/ui-store";

interface GuestEditorHeaderProps {
  name: string;
  onNameChange: (name: string) => void;
}

/** Header shown to unauthenticated visitors on /editor. No Share/collaborator
 * controls (there's nothing to share yet -- the board only exists in this
 * browser), and a persistent "Sign in to save" nudge instead. */
export function GuestEditorHeader({ name, onNameChange }: GuestEditorHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const { setExportDialogOpen, setShortcutsDialogOpen } = useUiStore();
  const { setTheme } = useTheme();

  function commit() {
    setEditing(false);
    if (draft.trim()) onNameChange(draft.trim());
  }

  return (
    <header className="flex h-14 items-center justify-between gap-2 border-b bg-card px-3 sm:gap-4 sm:px-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <PenTool className="h-4 w-4 shrink-0 text-primary" />
        {editing ? (
          <Input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && commit()}
            className="h-8 w-32 sm:w-48"
          />
        ) : (
          <button onClick={() => setEditing(true)} className="truncate rounded px-1.5 py-0.5 text-sm font-medium hover:bg-muted">
            {name}
          </button>
        )}
        <span className="hidden shrink-0 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground sm:inline">
          Guest
        </span>
      </div>

      <div className="hidden items-center gap-3 sm:flex">
        <SaveStatus />
        <UndoRedoControls />
        <BackgroundControl />
        <Button variant="outline" size="sm" onClick={() => setExportDialogOpen(true)}>
          <Download className="h-4 w-4" /> Export
        </Button>
        <ThemeToggle />
        <Button size="sm" asChild>
          <Link href="/login">
            <LogIn className="h-4 w-4" /> Sign in to save & share
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-1.5 sm:hidden">
        <UndoRedoControls />
        <Button size="icon" className="h-9 w-9" asChild aria-label="Sign in to save & share">
          <Link href="/login">
            <LogIn className="h-4 w-4" />
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="More options">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-2 py-1.5">
              <SaveStatus />
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
