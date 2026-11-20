"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RenameBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onConfirm: (name: string) => void;
}

export function RenameBoardDialog({ open, onOpenChange, currentName, onConfirm }: RenameBoardDialogProps) {
  const [name, setName] = useState(currentName);
  useEffect(() => {
    if (open) setName(currentName);
  }, [open, currentName]);

  const trimmed = name.trim();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (trimmed) onConfirm(trimmed);
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-display">Rename board</DialogTitle>
            <DialogDescription>Collaborators see the new name straight away.</DialogDescription>
          </DialogHeader>
          <Input autoFocus aria-label="Board name" value={name} onChange={(e) => setName(e.target.value)} onFocus={(e) => e.currentTarget.select()} maxLength={120} />
          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!trimmed || trimmed === currentName}>
              Save name
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
