import { create } from "zustand";

export type ToolType =
  | "select" | "hand" | "rectangle" | "diamond" | "ellipse" | "line" | "arrow" | "freehand" | "text" | "eraser";

export type SaveStatus = "saved" | "saving" | "offline" | "error";

interface UiStore {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  saveStatus: SaveStatus;
  setSaveStatus: (status: SaveStatus) => void;
  isShareDialogOpen: boolean;
  setShareDialogOpen: (open: boolean) => void;
  isExportDialogOpen: boolean;
  setExportDialogOpen: (open: boolean) => void;
  isShortcutsDialogOpen: boolean;
  setShortcutsDialogOpen: (open: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  activeTool: "select",
  setActiveTool: (tool) => set({ activeTool: tool }),
  saveStatus: "saved",
  setSaveStatus: (status) => set({ saveStatus: status }),
  isShareDialogOpen: false,
  setShareDialogOpen: (open) => set({ isShareDialogOpen: open }),
  isExportDialogOpen: false,
  setExportDialogOpen: (open) => set({ isExportDialogOpen: open }),
  isShortcutsDialogOpen: false,
  setShortcutsDialogOpen: (open) => set({ isShortcutsDialogOpen: open }),
}));
