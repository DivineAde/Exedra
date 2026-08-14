"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUiStore } from "@/stores/ui-store";
import { modifierKeyLabel } from "@/lib/utils";

function ShortcutRow({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex gap-1">
        {keys.map((key) => (
          <kbd key={key} className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}

export function KeyboardShortcutsDialog() {
  const { isShortcutsDialogOpen, setShortcutsDialogOpen } = useUiStore();
  const mod = modifierKeyLabel();

  return (
    <Dialog open={isShortcutsDialogOpen} onOpenChange={setShortcutsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>Work faster with these shortcuts.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-x-8">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Tools</p>
            <ShortcutRow keys={["V"]} label="Select" />
            <ShortcutRow keys={["H"]} label="Hand" />
            <ShortcutRow keys={["R"]} label="Rectangle" />
            <ShortcutRow keys={["D"]} label="Diamond" />
            <ShortcutRow keys={["O"]} label="Ellipse" />
            <ShortcutRow keys={["L"]} label="Line" />
            <ShortcutRow keys={["A"]} label="Arrow" />
            <ShortcutRow keys={["P"]} label="Draw" />
            <ShortcutRow keys={["T"]} label="Text" />
            <ShortcutRow keys={["E"]} label="Eraser" />
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Actions</p>
            <ShortcutRow keys={[mod, "Z"]} label="Undo" />
            <ShortcutRow keys={[mod, "Shift", "Z"]} label="Redo" />
            <ShortcutRow keys={[mod, "C"]} label="Copy" />
            <ShortcutRow keys={[mod, "V"]} label="Paste" />
            <ShortcutRow keys={[mod, "D"]} label="Duplicate" />
            <ShortcutRow keys={["Delete"]} label="Delete" />
            <ShortcutRow keys={["Esc"]} label="Deselect" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
