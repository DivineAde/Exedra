"use client";

import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateBoard } from "@/features/boards/use-boards";

export function CreateBoardButton() {
  const router = useRouter();
  const { mutate, isPending } = useCreateBoard();

  function handleCreate() {
    mutate("Untitled board", {
      onSuccess: (board) => router.push(`/boards/${board.id}`),
    });
  }

  return (
    <Button onClick={handleCreate} disabled={isPending}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      New board
    </Button>
  );
}
