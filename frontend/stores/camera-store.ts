import { create } from "zustand";
import { clampZoom, type Camera } from "@whiteboard/editor-core";

interface CameraStore {
  camera: Camera;
  setCamera: (camera: Camera) => void;
  pan: (dx: number, dy: number) => void;
  setZoom: (zoom: number) => void;
  resetZoom: () => void;
}

export const useCameraStore = create<CameraStore>((set, get) => ({
  camera: { x: 0, y: 0, zoom: 1 },
  setCamera: (camera) => set({ camera }),
  pan: (dx, dy) => {
    const { camera } = get();
    set({ camera: { ...camera, x: camera.x + dx, y: camera.y + dy } });
  },
  setZoom: (zoom) => {
    const { camera } = get();
    set({ camera: { ...camera, zoom: clampZoom(zoom) } });
  },
  resetZoom: () => {
    const { camera } = get();
    set({ camera: { ...camera, zoom: 1 } });
  },
}));
