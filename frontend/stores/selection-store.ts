import { create } from "zustand";

interface SelectionStore {
  selectedIds: string[];
  hoveredId: string | null;
  select: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  setHovered: (id: string | null) => void;
}

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  selectedIds: [],
  hoveredId: null,
  select: (ids) => set({ selectedIds: ids }),
  addToSelection: (id) => set({ selectedIds: [...get().selectedIds, id] }),
  toggleSelection: (id) => {
    const { selectedIds } = get();
    set({
      selectedIds: selectedIds.includes(id)
        ? selectedIds.filter((i) => i !== id)
        : [...selectedIds, id],
    });
  },
  clearSelection: () => set({ selectedIds: [] }),
  setHovered: (id) => set({ hoveredId: id }),
}));
