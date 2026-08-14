"use client";

import Link from "next/link";
import { MoreVertical, Copy, Trash2, Pencil } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { formatRelativeTime, cn } from "@/lib/utils";
import type { BoardSummaryDTO } from "@whiteboard/shared-types";

interface BoardCardProps {
  board: BoardSummaryDTO;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string) => void;
}

export function BoardCard({ board, onDelete, onDuplicate, onRename }: BoardCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md">
      <Link href={`/boards/${board.id}`} className="block">
        <div
          className={cn(
            "flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-accent to-secondary text-4xl font-semibold text-accent-foreground/40"
          )}
        >
          {board.name.charAt(0).toUpperCase()}
        </div>
      </Link>
      <div className="flex items-center justify-between gap-2 border-t px-4 py-3">
        <div className="min-w-0">
          <Link href={`/boards/${board.id}`} className="truncate text-sm font-medium hover:underline">
            {board.name}
          </Link>
          <p className="text-xs text-muted-foreground">Edited {formatRelativeTime(board.updatedAt)}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
              aria-label={`More options for ${board.name}`}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onRename(board.id)}>
              <Pencil className="mr-2 h-4 w-4" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(board.id)}>
              <Copy className="mr-2 h-4 w-4" /> Duplicate
            </DropdownMenuItem>
            {board.role === "OWNER" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(board.id)} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
