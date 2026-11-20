"use client";

import Link from "next/link";
import { MoreHorizontal, Copy, Trash2, Pencil } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { BoardThumbnail } from "./BoardThumbnail";
import { formatRelativeTime, cn } from "@/lib/utils";
import type { BoardSummaryDTO } from "@whiteboard/shared-types";

export interface BoardCardProps {
  board: BoardSummaryDTO;
  view?: "grid" | "list";
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string) => void;
}

const ROLE_LABEL = { OWNER: "Owner", EDITOR: "Can edit", VIEWER: "View only" } as const;

function BoardMenu({ board, onDelete, onDuplicate, onRename, className }: BoardCardProps & { className?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "relative z-10 rounded-lg p-1.5 text-muted-foreground transition-[opacity,background-color] hover:bg-secondary hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:opacity-100",
            className
          )}
          aria-label={`More options for ${board.name}`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => onRename(board.id)}>
          <Pencil className="mr-2 h-4 w-4" /> Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDuplicate(board.id)}>
          <Copy className="mr-2 h-4 w-4" /> Duplicate
        </DropdownMenuItem>
        {board.role === "OWNER" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(board.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function BoardCard(props: BoardCardProps) {
  const { board, view = "grid" } = props;
  const shared = board.role !== "OWNER";

  if (view === "list") {
    return (
      <div className="group relative flex items-center gap-4 px-4 py-3 transition-colors hover:bg-secondary/50">
        <div className="h-11 w-14 shrink-0 overflow-hidden rounded-lg border bg-dots bg-muted/40">
          <BoardThumbnail id={board.id} />
        </div>
        <div className="min-w-0 flex-1">
          <Link href={`/boards/${board.id}`} className="block truncate text-sm font-medium after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring">
            {board.name}
          </Link>
          <p className="text-xs text-muted-foreground sm:hidden">Edited {formatRelativeTime(board.updatedAt)}</p>
        </div>
        {shared && <span className="hidden rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground sm:block">{ROLE_LABEL[board.role]}</span>}
        <span className="hidden w-28 text-right text-xs text-muted-foreground sm:block">Edited {formatRelativeTime(board.updatedAt)}</span>
        <BoardMenu {...props} className="opacity-100 md:opacity-0 md:group-hover:opacity-100" />
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-[border-color,box-shadow] duration-200 hover:border-foreground/25 hover:shadow-[0_10px_30px_-14px_hsl(var(--foreground)/0.3)] focus-within:border-foreground/25">
      <div className="relative aspect-[16/11] overflow-hidden border-b bg-dots bg-muted/40">
        <div className="h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.04]">
          <BoardThumbnail id={board.id} />
        </div>
        {shared && (
          <span className="absolute left-3 top-3 rounded-full border bg-card/90 px-2 py-0.5 text-xs font-medium backdrop-blur">{ROLE_LABEL[board.role]}</span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="min-w-0">
          <Link href={`/boards/${board.id}`} className="block truncate text-sm font-medium after:absolute after:inset-0 focus-visible:outline-none">
            {board.name}
          </Link>
          <p className="text-xs text-muted-foreground">Edited {formatRelativeTime(board.updatedAt)}</p>
        </div>
        <BoardMenu {...props} className="opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100" />
      </div>
    </div>
  );
}
