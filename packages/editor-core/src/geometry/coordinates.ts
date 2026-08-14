export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

/** Convert a screen-space point (e.g. mouse event clientX/Y relative to
 * the canvas) into world/document space, accounting for pan + zoom. */
export function screenToWorld(
  screenX: number,
  screenY: number,
  camera: Camera
): { x: number; y: number } {
  return {
    x: screenX / camera.zoom + camera.x,
    y: screenY / camera.zoom + camera.y,
  };
}

/** Convert a world-space point into screen space for rendering. */
export function worldToScreen(
  worldX: number,
  worldY: number,
  camera: Camera
): { x: number; y: number } {
  return {
    x: (worldX - camera.x) * camera.zoom,
    y: (worldY - camera.y) * camera.zoom,
  };
}

export const ZOOM_MIN = 0.1;
export const ZOOM_MAX = 4;

export function clampZoom(zoom: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom));
}

/** Zoom while keeping a fixed screen point (e.g. cursor position) stable. */
export function zoomAtPoint(
  camera: Camera,
  screenX: number,
  screenY: number,
  nextZoom: number
): Camera {
  const clamped = clampZoom(nextZoom);
  const worldBefore = screenToWorld(screenX, screenY, camera);
  const newCamera = { ...camera, zoom: clamped };
  const worldAfter = screenToWorld(screenX, screenY, newCamera);
  return {
    zoom: clamped,
    x: camera.x + (worldBefore.x - worldAfter.x),
    y: camera.y + (worldBefore.y - worldAfter.y),
  };
}
