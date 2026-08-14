"use client";

import { useEditorStore } from "@/stores/editor-store";
import { useSelectionStore } from "@/stores/selection-store";
import { DEFAULT_STROKE_COLORS, DEFAULT_BACKGROUND_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Copy, Trash2 } from "lucide-react";
import type { StrokeStyle, Sloppiness, EdgeStyle } from "@whiteboard/editor-core";

const STROKE_STYLES: Array<{ value: StrokeStyle; label: string }> = [
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
];

const SLOPPINESS_OPTIONS: Array<{ value: Sloppiness; label: string }> = [
  { value: "architect", label: "Architect" },
  { value: "normal", label: "Normal" },
  { value: "artist", label: "Artist" },
];

const EDGE_OPTIONS: Array<{ value: EdgeStyle; label: string }> = [
  { value: "sharp", label: "Sharp" },
  { value: "rounded", label: "Rounded" },
];

const SHAPES_WITH_EDGES = new Set(["rectangle", "diamond"]);
const SHAPES_ONLY = new Set(["rectangle", "diamond", "ellipse"]);

/** Contextual property editor for the current selection: stroke, fill,
 * stroke style, sloppiness, edges, width, opacity, font size, plus
 * duplicate/delete actions. Wide enough (`w-80`) for label-left,
 * control-right rows to sit comfortably -- the previous `w-56` panel
 * squeezed three-way segmented buttons (e.g. "Architect"/"Normal"/
 * "Artist") into ~60px each, which is what forced the earlier, more
 * cramped layout. Dropdowns for the multi-option controls plus a wider
 * panel fit the same information without crowding. */
export function PropertiesPanel() {
  const { document, updateElement, duplicateElements, deleteElements } = useEditorStore();
  const { selectedIds, select, clearSelection } = useSelectionStore();

  if (selectedIds.length === 0) return null;

  const elements = document.elements.filter((e) => selectedIds.includes(e.id));
  const first = elements[0];
  if (!first) return null;

  const isText = elements.every((e) => e.type === "text");
  const isLineLike = elements.every((e) => e.type === "line" || e.type === "arrow" || e.type === "freehand");
  const allSupportEdges = elements.every((e) => SHAPES_WITH_EDGES.has(e.type));
  const allAreShapes = elements.every((e) => SHAPES_ONLY.has(e.type));

  function applyToSelection(changes: Record<string, unknown>) {
    for (const id of selectedIds) updateElement(id, changes as never);
  }

  function handleDuplicate() {
    const newIds = duplicateElements(selectedIds);
    select(newIds);
  }

  function handleDelete() {
    deleteElements(selectedIds);
    clearSelection();
  }

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 flex max-h-[70vh] flex-col gap-3 overflow-y-auto rounded-t-2xl border-t bg-card/95 p-4 pb-6 text-sm shadow-lg backdrop-blur",
        // Desktop: float as a compact panel in the top-right corner instead
        // of a full-width sheet pinned to the bottom of the viewport.
        "sm:absolute sm:inset-x-auto sm:right-4 sm:top-4 sm:bottom-auto sm:max-h-[calc(100%-2rem)] sm:w-80 sm:rounded-xl sm:border sm:pb-4"
      )}
    >
      {/* Drag-handle affordance, mobile only -- signals this is a sheet
          that can be dismissed, matching standard bottom-sheet conventions. */}
      <div className="mx-auto -mt-1 h-1 w-10 shrink-0 rounded-full bg-border sm:hidden" />
      <Row label="Stroke">
        <div className="flex gap-1.5">
          {DEFAULT_STROKE_COLORS.map((color) => (
            <ColorSwatch key={color} color={color} active={first.strokeColor === color} onClick={() => applyToSelection({ strokeColor: color })} />
          ))}
        </div>
      </Row>

      {!isText && (
        <Row label="Fill">
          <div className="flex gap-1.5">
            {DEFAULT_BACKGROUND_COLORS.map((color) => (
              <ColorSwatch key={color} color={color} active={first.backgroundColor === color} onClick={() => applyToSelection({ backgroundColor: color })} transparent={color === "transparent"} />
            ))}
          </div>
        </Row>
      )}

      {!isText && (
        <Row label="Style">
          <SelectControl
            value={first.strokeStyle}
            options={STROKE_STYLES}
            onChange={(value) => applyToSelection({ strokeStyle: value })}
          />
        </Row>
      )}

      {(allAreShapes || isLineLike) && "sloppiness" in first && (
        <Row label="Sloppiness">
          <SelectControl
            value={(first as { sloppiness: Sloppiness }).sloppiness}
            options={SLOPPINESS_OPTIONS}
            onChange={(value) => applyToSelection({ sloppiness: value })}
          />
        </Row>
      )}

      {allSupportEdges && (
        <Row label="Edges">
          <SelectControl
            value={(first as { edges: EdgeStyle }).edges}
            options={EDGE_OPTIONS}
            onChange={(value) => applyToSelection({ edges: value })}
          />
        </Row>
      )}

      <Row label="Width">
        <div className="flex flex-1 items-center gap-2">
          <input
            type="range"
            min={1}
            max={12}
            value={first.strokeWidth}
            onChange={(e) => applyToSelection({ strokeWidth: Number(e.target.value) })}
            className="flex-1 accent-primary"
          />
          <span className="w-8 shrink-0 text-right text-xs text-muted-foreground">{first.strokeWidth}px</span>
        </div>
      </Row>

      <Row label="Opacity">
        <div className="flex flex-1 items-center gap-2">
          <input
            type="range"
            min={0}
            max={100}
            value={first.opacity}
            onChange={(e) => applyToSelection({ opacity: Number(e.target.value) })}
            className="flex-1 accent-primary"
          />
          <span className="w-8 shrink-0 text-right text-xs text-muted-foreground">{first.opacity}%</span>
        </div>
      </Row>

      {isText && "fontSize" in first && (
        <Row label="Font size">
          <div className="flex flex-1 items-center gap-2">
            <input
              type="range"
              min={12}
              max={72}
              value={(first as { fontSize: number }).fontSize}
              onChange={(e) => applyToSelection({ fontSize: Number(e.target.value) })}
              className="flex-1 accent-primary"
            />
            <span className="w-8 shrink-0 text-right text-xs text-muted-foreground">
              {(first as { fontSize: number }).fontSize}
            </span>
          </div>
        </Row>
      )}

      <div className="flex gap-2 border-t pt-3">
        <Button variant="outline" size="sm" className="flex-1" onClick={handleDuplicate}>
          <Copy className="h-3.5 w-3.5" /> Duplicate
        </Button>
        <Button variant="outline" size="sm" className="flex-1 text-destructive hover:text-destructive" onClick={handleDelete}>
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-1 items-center">{children}</div>
    </div>
  );
}

function SelectControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger className="h-8 flex-1 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ColorSwatch({ color, active, onClick, transparent }: { color: string; active: boolean; onClick: () => void; transparent?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={`Set color ${color}`}
      className={cn(
        "h-6 w-6 rounded-full border-2 transition-transform hover:scale-110",
        active ? "border-primary" : "border-transparent",
        transparent && "bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%)] bg-[length:6px_6px]"
      )}
      style={{ backgroundColor: transparent ? undefined : color }}
    />
  );
}
