import { create } from "zustand";
import type { PresenceUser } from "@whiteboard/shared-types";

interface RemoteCursor {
  x: number;
  y: number;
}

interface CollaborationStore {
  presence: PresenceUser[];
  remoteCursors: Record<string, RemoteCursor>;
  remoteSelections: Record<string, string[]>;
  connectionState: "connected" | "connecting" | "disconnected";
  setPresence: (users: PresenceUser[]) => void;
  setRemoteCursor: (userId: string, cursor: RemoteCursor) => void;
  setRemoteSelection: (userId: string, elementIds: string[]) => void;
  removeUser: (userId: string) => void;
  setConnectionState: (state: CollaborationStore["connectionState"]) => void;
}

export const useCollaborationStore = create<CollaborationStore>((set, get) => ({
  presence: [],
  remoteCursors: {},
  remoteSelections: {},
  connectionState: "disconnected",
  setPresence: (users) => set({ presence: users }),
  setRemoteCursor: (userId, cursor) =>
    set({ remoteCursors: { ...get().remoteCursors, [userId]: cursor } }),
  setRemoteSelection: (userId, elementIds) =>
    set({ remoteSelections: { ...get().remoteSelections, [userId]: elementIds } }),
  removeUser: (userId) => {
    const cursors = { ...get().remoteCursors };
    const selections = { ...get().remoteSelections };
    delete cursors[userId];
    delete selections[userId];
    set({ remoteCursors: cursors, remoteSelections: selections });
  },
  setConnectionState: (state) => set({ connectionState: state }),
}));
