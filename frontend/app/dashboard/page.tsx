"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpDown, Check, LayoutGrid, List, Clock, Users, SearchX } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { BoardGrid } from "@/components/boards/BoardGrid";
import { CreateBoardButton } from "@/components/boards/CreateBoardButton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { BoardGridSkeleton, DashboardSkeleton } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { DeleteBoardDialog } from "@/components/dialogs/DeleteBoardDialog";
import { RenameBoardDialog } from "@/components/dialogs/RenameBoardDialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useBoards, useDeleteBoard, useDuplicateBoard, useRenameBoard } from "@/features/boards/use-boards";
import { applyFilter, parseFilter, sortBoards, type BoardSort } from "@/features/boards/board-filters";
import { cn } from "@/lib/utils";

const VIEW_KEY = "exedra:board-view";
const SORTS: { value: BoardSort; label: string }[] = [
  { value: "edited", label: "Last edited" },
  { value: "created", label: "Date created" },
  { value: "name", label: "Name" },
];
const TITLES = { all: "All boards", recent: "Recent", shared: "Shared with me" } as const;

export default function DashboardPage() {
  // useSearchParams needs a Suspense boundary during static prerender.
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const filter = parseFilter(useSearchParams().get("filter"));
  const { data: boards, isLoading, isError, refetch } = useBoards();
  const deleteBoard = useDeleteBoard();
  const duplicateBoard = useDuplicateBoard();
  const renameBoard = useRenameBoard();

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<BoardSort>("edited");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(VIEW_KEY) === "list") setView("list");
    } catch {}
  }, []);

  function changeView(next: "grid" | "list") {
    setView(next);
    try {
      window.localStorage.setItem(VIEW_KEY, next);
    } catch {}
  }

  const inFilter = useMemo(() => applyFilter(boards ?? [], filter), [boards, filter]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortBoards(q ? inFilter.filter((b) => b.name.toLowerCase().includes(q)) : inFilter, sort);
  }, [inFilter, query, sort]);

  const renameTarget = boards?.find((b) => b.id === renameId);
  const deleteTarget = boards?.find((b) => b.id === deleteId);
  const hasBoards = (boards?.length ?? 0) > 0;

  const subtitle = isLoading
    ? "Loading your boards"
    : filter === "recent"
      ? "Boards you edited in the last 7 days."
      : filter === "shared"
        ? "Boards other people invited you to."
        : "Pick up where you left off, or start something new.";

  return (
    <DashboardLayout>
      <TopNavigation onSearch={setQuery} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-8">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-semibold">{TITLES[filter]}</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
            </div>

            {!isLoading && !isError && hasBoards && (
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ArrowUpDown className="h-3.5 w-3.5" />
                      {SORTS.find((s) => s.value === sort)?.label}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {SORTS.map((s) => (
                      <DropdownMenuItem key={s.value} onClick={() => setSort(s.value)} className="justify-between">
                        {s.label}
                        {sort === s.value && <Check className="h-4 w-4 text-foreground" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div role="group" aria-label="Board layout" className="flex rounded-lg border bg-card p-0.5 shadow-sm">
                  {([["grid", LayoutGrid, "Grid view"], ["list", List, "List view"]] as const).map(([v, Icon, label]) => (
                    <button
                      key={v}
                      onClick={() => changeView(v)}
                      aria-label={label}
                      aria-pressed={view === v}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        view === v ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isLoading && <BoardGridSkeleton view={view} />}

          {isError && <ErrorState message="Couldn't load your boards. Check your connection and try again." onRetry={() => refetch()} />}

          {!isLoading && !isError && !hasBoards && (
            <EmptyState
              icon={LayoutGrid}
              title="Start your first board"
              description="Sketch a flow, map out an idea, or invite a teammate and draw together in real time."
              action={<CreateBoardButton className="relative mt-3" />}
            />
          )}

          {!isLoading && !isError && hasBoards && inFilter.length === 0 && (
            <EmptyState
              icon={filter === "shared" ? Users : Clock}
              title={filter === "shared" ? "Nothing shared with you yet" : "Nothing edited this week"}
              description={filter === "shared" ? "When someone invites you to a board, it shows up here." : "Open a board and make a change. It will appear here."}
            />
          )}

          {!isLoading && !isError && inFilter.length > 0 && visible.length === 0 && (
            <EmptyState icon={SearchX} title="No matching boards" description={`Nothing in ${TITLES[filter].toLowerCase()} matches “${query.trim()}”.`} />
          )}

          {!isLoading && !isError && visible.length > 0 && (
            <BoardGrid
              boards={visible}
              view={view}
              showNewTile={filter === "all" && !query.trim()}
              onDelete={setDeleteId}
              onDuplicate={(id) => duplicateBoard.mutate(id)}
              onRename={setRenameId}
            />
          )}
        </div>
      </main>

      <RenameBoardDialog
        open={!!renameTarget}
        onOpenChange={(o) => !o && setRenameId(null)}
        currentName={renameTarget?.name ?? ""}
        onConfirm={(name) => {
          if (renameId) renameBoard.mutate({ boardId: renameId, name });
          setRenameId(null);
        }}
      />
      <DeleteBoardDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteId(null)}
        boardName={deleteTarget?.name ?? ""}
        isDeleting={deleteBoard.isPending}
        onConfirm={() => {
          if (deleteId) deleteBoard.mutate(deleteId, { onSettled: () => setDeleteId(null) });
        }}
      />
    </DashboardLayout>
  );
}
