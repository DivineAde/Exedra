"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";
import { useEditorStore } from "@/stores/editor-store";
import { useSelectionStore } from "@/stores/selection-store";
import { getElementsBounds, extractSubDocument, serializeDocument } from "@whiteboard/editor-core";
import { renderFrame } from "@/editor/rendering/canvas-renderer";
import { FileJson, FileImage, FileCode } from "lucide-react";
import { toast } from "sonner";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportDialog({ boardName }: { boardName: string }) {
  const { isExportDialogOpen, setExportDialogOpen } = useUiStore();
  const { document: doc } = useEditorStore();
  const selectedIds = useSelectionStore((s) => s.selectedIds);

  function exportJSON() {
    const sub = extractSubDocument(doc, selectedIds.length ? selectedIds : null);
    const blob = new Blob([serializeDocument(sub)], { type: "application/json" });
    downloadBlob(blob, `${boardName}.json`);
    toast.success("Exported JSON");
  }

  function exportPNG() {
    const sub = extractSubDocument(doc, selectedIds.length ? selectedIds : null);
    const bounds = getElementsBounds(sub.elements);
    if (!bounds) {
      toast.error("Nothing to export");
      return;
    }
    const padding = 40;
    const width = bounds.maxX - bounds.minX + padding * 2;
    const height = bounds.maxY - bounds.minY + padding * 2;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = sub.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    renderFrame(ctx, width, height, { x: bounds.minX - padding, y: bounds.minY - padding, zoom: 1 }, sub, {
      selectedIds: new Set(),
      hoveredId: null,
      isDarkMode: false,
      selectionRect: null,
      editingElementId: null,
      dpr: 1,
    });

    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `${boardName}.png`);
      toast.success("Exported PNG");
    });
  }

  function exportSVG() {
    const sub = extractSubDocument(doc, selectedIds.length ? selectedIds : null);
    const bounds = getElementsBounds(sub.elements);
    if (!bounds) {
      toast.error("Nothing to export");
      return;
    }
    // A lightweight SVG export: shapes as native SVG primitives.
    // Freehand/arrow curve fidelity is intentionally simplified here.
    const padding = 40;
    const width = bounds.maxX - bounds.minX + padding * 2;
    const height = bounds.maxY - bounds.minY + padding * 2;
    const offsetX = -bounds.minX + padding;
    const offsetY = -bounds.minY + padding;

    const shapes = sub.elements
      .map((el) => {
        const x = el.x + offsetX;
        const y = el.y + offsetY;
        if (el.type === "rectangle") {
          return `<rect x="${x}" y="${y}" width="${el.width}" height="${el.height}" rx="${el.edges === "sharp" ? 0 : el.cornerRadius}" fill="${el.backgroundColor}" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" opacity="${el.opacity / 100}" />`;
        }
        if (el.type === "diamond") {
          const w = el.width, h = el.height;
          const points = `${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`;
          return `<polygon points="${points}" fill="${el.backgroundColor}" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" opacity="${el.opacity / 100}" />`;
        }
        if (el.type === "ellipse") {
          return `<ellipse cx="${x + el.width / 2}" cy="${y + el.height / 2}" rx="${Math.abs(el.width / 2)}" ry="${Math.abs(el.height / 2)}" fill="${el.backgroundColor}" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" opacity="${el.opacity / 100}" />`;
        }
        return "";
      })
      .join("\n");

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="${sub.backgroundColor}" />
${shapes}
</svg>`;

    downloadBlob(new Blob([svg], { type: "image/svg+xml" }), `${boardName}.svg`);
    toast.success("Exported SVG");
  }

  return (
    <Dialog open={isExportDialogOpen} onOpenChange={setExportDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export board</DialogTitle>
          <DialogDescription>
            {selectedIds.length ? `Exporting ${selectedIds.length} selected element(s).` : "Exporting the full board."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3">
          <Button variant="outline" className="flex h-20 flex-col gap-1" onClick={exportPNG}>
            <FileImage className="h-5 w-5" /> PNG
          </Button>
          <Button variant="outline" className="flex h-20 flex-col gap-1" onClick={exportSVG}>
            <FileCode className="h-5 w-5" /> SVG
          </Button>
          <Button variant="outline" className="flex h-20 flex-col gap-1" onClick={exportJSON}>
            <FileJson className="h-5 w-5" /> JSON
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
