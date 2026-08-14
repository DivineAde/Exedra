import { create } from "zustand";
import {
  createEmptyDocument,
  HistoryManager,
  CreateElementCommand,
  UpdateElementCommand,
  MoveElementCommand,
  DuplicateElementCommand,
  DeleteElementCommand,
  type BoardDocument,
  type BoardElement,
} from "@whiteboard/editor-core";

interface EditorStore {
  document: BoardDocument;
  boardId: string | null;
  history: HistoryManager;
  clipboard: BoardElement[];

  loadDocument: (boardId: string, document: BoardDocument) => void;
  setBackgroundColor: (color: string) => void;

  createElement: (element: BoardElement) => void;
  updateElement: (elementId: string, changes: Partial<BoardElement>) => void;
  deleteElements: (elementIds: string[]) => void;
  moveElements: (elementIds: string[], dx: number, dy: number) => void;
  duplicateElements: (elementIds: string[]) => string[];

  copySelection: (elementIds: string[]) => void;
  pasteClipboard: (offsetX?: number, offsetY?: number) => string[];

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  /** Apply a change that originated from a remote collaborator --
   * bypasses local history so a peer's undo doesn't undo *your* edits. */
  applyRemoteCreate: (element: BoardElement) => void;
  applyRemoteUpdate: (elementId: string, changes: Partial<BoardElement>) => void;
  applyRemoteDelete: (elementId: string) => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  document: createEmptyDocument(),
  boardId: null,
  history: new HistoryManager(),
  clipboard: [],

  loadDocument: (boardId, document) => {
    get().history.clear();
    set({ boardId, document });
  },

  setBackgroundColor: (color) => {
    const { document } = get();
    set({ document: { ...document, backgroundColor: color, version: document.version + 1 } });
  },

  createElement: (element) => {
    const { document, history } = get();
    set({ document: history.execute(new CreateElementCommand(element), document) });
  },

  updateElement: (elementId, changes) => {
    const { document, history } = get();
    set({ document: history.execute(new UpdateElementCommand(elementId, changes), document) });
  },

  deleteElements: (elementIds) => {
    let { document } = get();
    const { history } = get();
    for (const id of elementIds) {
      document = history.execute(new DeleteElementCommand(id), document);
    }
    set({ document });
  },

  moveElements: (elementIds, dx, dy) => {
    const { document, history } = get();
    set({ document: history.execute(new MoveElementCommand(elementIds, dx, dy), document) });
  },

  duplicateElements: (elementIds) => {
    const { document, history } = get();
    const command = new DuplicateElementCommand(elementIds);
    const next = history.execute(command, document);
    set({ document: next });
    return command.createdIds;
  },

  copySelection: (elementIds) => {
    const { document } = get();
    const idSet = new Set(elementIds);
    set({ clipboard: document.elements.filter((e) => idSet.has(e.id)) });
  },

  pasteClipboard: (offsetX = 16, offsetY = 16) => {
    const { clipboard, document, history } = get();
    if (clipboard.length === 0) return [];
    let doc = document;
    const newIds: string[] = [];
    for (const el of clipboard) {
      const clone: BoardElement = {
        ...el,
        id: `${el.id}-${Math.random().toString(36).slice(2, 8)}`,
        x: el.x + offsetX,
        y: el.y + offsetY,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      doc = history.execute(new CreateElementCommand(clone), doc);
      newIds.push(clone.id);
    }
    set({ document: doc });
    return newIds;
  },

  undo: () => {
    const { document, history } = get();
    const next = history.undo(document);
    if (next) set({ document: next });
  },

  redo: () => {
    const { document, history } = get();
    const next = history.redo(document);
    if (next) set({ document: next });
  },

  canUndo: () => get().history.canUndo(),
  canRedo: () => get().history.canRedo(),

  applyRemoteCreate: (element) => {
    const { document } = get();
    if (document.elements.some((e) => e.id === element.id)) return;
    set({ document: { ...document, elements: [...document.elements, element], version: document.version + 1 } });
  },

  applyRemoteUpdate: (elementId, changes) => {
    const { document } = get();
    set({
      document: {
        ...document,
        elements: document.elements.map((e) =>
          e.id === elementId ? ({ ...e, ...changes } as BoardElement) : e
        ),
        version: document.version + 1,
      },
    });
  },

  applyRemoteDelete: (elementId) => {
    const { document } = get();
    set({
      document: {
        ...document,
        elements: document.elements.filter((e) => e.id !== elementId),
        version: document.version + 1,
      },
    });
  },
}));
