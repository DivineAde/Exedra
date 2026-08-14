"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardName: string;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteBoardDialog({ open, onOpenChange, boardName, onConfirm, isDeleting }: DeleteBoardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete &ldquo;{boardName}&rdquo;?</DialogTitle>
          <DialogDescription>
            This board and all of its content will be permanently deleted. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            Delete board
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
