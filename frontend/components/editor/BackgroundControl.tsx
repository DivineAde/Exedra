"use client";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useEditorStore } from "@/stores/editor-store";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const BACKGROUND_OPTIONS = ["#ffffff", "#f8f9fa", "#f1f3f5", "#fff9db", "#e7f5ff", "#1e1e2e"];

/** Controls BoardDocument.backgroundColor -- part of the persisted document,
 * so it saves/loads with the board like any other document field. */
export function BackgroundControl() {
  const { document, setBackgroundColor } = useEditorStore();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Change canvas background"
          className="flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Palette className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Canvas background</p>
        <div className="flex flex-wrap gap-2">
          {BACKGROUND_OPTIONS.map((color) => (
            <button
              key={color}
              onClick={() => setBackgroundColor(color)}
              aria-label={`Set background ${color}`}
              className={cn(
                "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
                document.backgroundColor === color ? "border-primary" : "border-border"
              )}
              style={{ backgroundColor: color }}
            />
          ))}
          <label className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-border text-[10px] text-muted-foreground">
            +
            <input
              type="color"
              value={document.backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="sr-only"
            />
          </label>
        </div>
      </PopoverContent>
    </Popover>
  );
}
