import { createEmptyDocument, type BoardDocument } from "@whiteboard/editor-core";

const DB_NAME = "whiteboard-guest";
const STORE_NAME = "boards";
const DB_VERSION = 1;
export const GUEST_BOARD_KEY = "current-guest-board";

export interface LocalBoard {
  name: string;
  document: BoardDocument;
  updatedAt: number;
}

/**
 * Thin native-IndexedDB wrapper (no extra dependency) used to persist a
 * guest's in-progress board locally, so unauthenticated visitors can draw,
 * refresh, and come back without losing work. Nothing here ever leaves
 * the browser until the guest explicitly signs in (see guest-migration.ts).
 */
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this environment"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const request = fn(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

export async function getLocalBoard(): Promise<LocalBoard | null> {
  try {
    const result = await withStore<LocalBoard | undefined>("readonly", (store) => store.get(GUEST_BOARD_KEY));
    return result ?? null;
  } catch {
    return null;
  }
}

export async function saveLocalBoard(board: LocalBoard): Promise<void> {
  try {
    await withStore("readwrite", (store) => store.put(board, GUEST_BOARD_KEY));
  } catch {
    // Local persistence is best-effort; a failure here (e.g. private
    // browsing mode blocking IndexedDB) shouldn't break the editor.
  }
}

export async function clearLocalBoard(): Promise<void> {
  try {
    await withStore("readwrite", (store) => store.delete(GUEST_BOARD_KEY));
  } catch {
    // best-effort, see saveLocalBoard
  }
}

export function createEmptyLocalBoard(): LocalBoard {
  return { name: "Untitled board", document: createEmptyDocument(), updatedAt: Date.now() };
}

/** A local board is worth migrating/warning about only if it actually has
 * content -- an empty freshly-opened guest session shouldn't prompt anything. */
export function isLocalBoardMeaningful(board: LocalBoard | null): board is LocalBoard {
  return !!board && board.document.elements.length > 0;
}
