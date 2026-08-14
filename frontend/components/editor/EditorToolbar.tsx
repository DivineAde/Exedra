"use client";

import { MousePointer2, Hand, Square, Diamond, Circle, Minus, ArrowRight, Pencil, Type, Eraser } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useUiStore, type ToolType } from "@/stores/ui-store";
import { TOOL_SHORTCUTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const TOOLS: Array<{ tool: ToolType; icon: typeof MousePointer2; label: string }> = [
  { tool: "select", icon: MousePointer2, label: "Select" },
  { tool: "hand", icon: Hand, label: "Hand" },
  { tool: "rectangle", icon: Square, label: "Rectangle" },
  { tool: "diamond", icon: Diamond, label: "Diamond" },
  { tool: "ellipse", icon: Circle, label: "Ellipse" },
  { tool: "line", icon: Minus, label: "Line" },
  { tool: "arrow", icon: ArrowRight, label: "Arrow" },
  { tool: "freehand", icon: Pencil, label: "Draw" },
  { tool: "text", icon: Type, label: "Text" },
  { tool: "eraser", icon: Eraser, label: "Eraser" },
];

export function EditorToolbar() {
  const { activeTool, setActiveTool } = useUiStore();

  return (
    <TooltipProvider delayDuration={300}>
      <div
        role="toolbar"
        aria-label="Drawing tools"
        className={cn(
          "absolute z-20 flex items-center gap-1 rounded-xl border bg-card/95 shadow-lg backdrop-blur",
          // Mobile: pinned to the bottom, full-width-ish, horizontally
          // scrollable if it doesn't quite fit (rather than shrinking
          // touch targets below the ~44px minimum). Desktop: centered
          // floating toolbar at the top, as before.
          "bottom-4 left-1/2 max-w-[calc(100%-2rem)] -translate-x-1/2 overflow-x-auto p-1.5",
          "sm:bottom-auto sm:top-4 sm:max-w-none sm:overflow-visible"
        )}
      >
        {TOOLS.map(({ tool, icon: Icon, label }) => (
          <Tooltip key={tool}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setActiveTool(tool)}
                aria-label={label}
                aria-pressed={activeTool === tool}
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors sm:h-9 sm:w-9",
                  activeTool === tool ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {label} <span className="ml-1 text-muted-foreground">{TOOL_SHORTCUTS[tool as keyof typeof TOOL_SHORTCUTS]?.toUpperCase()}</span>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
