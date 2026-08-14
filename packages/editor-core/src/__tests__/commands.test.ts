import { describe, it, expect } from "vitest";
import { createEmptyDocument } from "../elements/types";
import { createRectangle } from "../elements/factory";
import { CreateElementCommand } from "../commands/create-element";
import { UpdateElementCommand } from "../commands/update-element";
import { MoveElementCommand } from "../commands/move-element";
import { DuplicateElementCommand } from "../commands/duplicate-element";
import { HistoryManager } from "../history/history";
import { getElementBounds, getElementsBounds } from "../geometry/bounds";
import { hitTestElement, elementIntersectsRect } from "../geometry/collision";
import { screenToWorld, worldToScreen, zoomAtPoint } from "../geometry/coordinates";
import { serializeDocument, deserializeDocument } from "../serialization/board-document";

describe("element creation", () => {
  it("creates a rectangle with default style", () => {
    const rect = createRectangle(10, 20);
    expect(rect.type).toBe("rectangle");
    expect(rect.x).toBe(10);
    expect(rect.y).toBe(20);
  });
});

describe("commands + history", () => {
  it("creates and deletes via undo/redo", () => {
    const history = new HistoryManager();
    let doc = createEmptyDocument();
    const rect = createRectangle(0, 0);

    doc = history.execute(new CreateElementCommand(rect), doc);
    expect(doc.elements).toHaveLength(1);

    doc = history.undo(doc)!;
    expect(doc.elements).toHaveLength(0);

    doc = history.redo(doc)!;
    expect(doc.elements).toHaveLength(1);
  });

  it("moves an element and can undo the move", () => {
    const history = new HistoryManager();
    let doc = createEmptyDocument();
    const rect = createRectangle(0, 0);
    doc = history.execute(new CreateElementCommand(rect), doc);

    doc = history.execute(new MoveElementCommand([rect.id], 50, 25), doc);
    expect(doc.elements[0]?.x).toBe(50);
    expect(doc.elements[0]?.y).toBe(25);

    doc = history.undo(doc)!;
    expect(doc.elements[0]?.x).toBe(0);
    expect(doc.elements[0]?.y).toBe(0);
  });

  it("updates element properties and inverts precisely", () => {
    const history = new HistoryManager();
    let doc = createEmptyDocument();
    const rect = createRectangle(0, 0);
    doc = history.execute(new CreateElementCommand(rect), doc);

    doc = history.execute(
      new UpdateElementCommand(rect.id, { strokeColor: "#ff0000" }),
      doc
    );
    expect(doc.elements[0]?.strokeColor).toBe("#ff0000");

    doc = history.undo(doc)!;
    expect(doc.elements[0]?.strokeColor).toBe("#1e1e1e");
  });

  it("duplicates elements with an offset", () => {
    const history = new HistoryManager();
    let doc = createEmptyDocument();
    const rect = createRectangle(0, 0);
    doc = history.execute(new CreateElementCommand(rect), doc);

    const dup = new DuplicateElementCommand([rect.id]);
    doc = history.execute(dup, doc);
    expect(doc.elements).toHaveLength(2);
    expect(doc.elements[1]?.x).toBe(16);
  });

  it("clears redo stack after a new command", () => {
    const history = new HistoryManager();
    let doc = createEmptyDocument();
    const rect = createRectangle(0, 0);
    doc = history.execute(new CreateElementCommand(rect), doc);
    doc = history.undo(doc)!;
    expect(history.canRedo()).toBe(true);

    doc = history.execute(new CreateElementCommand(createRectangle(5, 5)), doc);
    expect(history.canRedo()).toBe(false);
  });
});

describe("geometry", () => {
  it("computes element bounds regardless of negative width/height", () => {
    const rect = { ...createRectangle(10, 10), width: -20, height: -5 };
    const b = getElementBounds(rect);
    expect(b.minX).toBe(-10);
    expect(b.maxX).toBe(10);
  });

  it("computes bounds for line/arrow/freehand from their points, not width/height", () => {
    // Simulates the real drawing flow: only `points` gets updated while
    // dragging (see use-canvas-interactions.ts), width/height stay at
    // their initial 0 -- bounds must still reflect the actual path.
    const arrow = {
      ...createRectangle(100, 100),
      type: "arrow" as const,
      width: 0,
      height: 0,
      points: [
        [0, 0],
        [50, -30],
      ] as Array<[number, number]>,
      startArrowhead: "none" as const,
      endArrowhead: "arrow" as const,
    };
    const bounds = getElementBounds(arrow);
    expect(bounds.minX).toBe(100);
    expect(bounds.maxX).toBe(150);
    expect(bounds.minY).toBe(70);
    expect(bounds.maxY).toBe(100);
  });

  it("hit tests a line/arrow far from its start point", () => {
    // Regression test: before the bounds fix above, hitTestElement's
    // bounding-box pre-check used width/height (always 0 for these
    // types), so anything more than a few px from the start point was
    // silently unreachable by both selection and the eraser.
    const line = {
      ...createRectangle(0, 0),
      type: "line" as const,
      width: 0,
      height: 0,
      points: [
        [0, 0],
        [200, 0],
      ] as Array<[number, number]>,
    };
    expect(hitTestElement(200, 0, line)).toBe(true);
    expect(hitTestElement(150, 2, line)).toBe(true);
    expect(hitTestElement(150, 50, line)).toBe(false);
  });

  it("hit tests a freehand stroke that extends in multiple directions from its anchor", () => {
    const freehand = {
      ...createRectangle(50, 50),
      type: "freehand" as const,
      width: 0,
      height: 0,
      points: [
        [0, 0],
        [-30, 0],
        [-30, 40],
      ] as Array<[number, number]>,
    };
    expect(hitTestElement(20, 90, freehand)).toBe(true); // near the far end, up-left of anchor
    expect(hitTestElement(20, 90 + 200, freehand)).toBe(false);
  });

  it("merges bounds across multiple elements", () => {
    const a = { ...createRectangle(0, 0), width: 10, height: 10 };
    const b = { ...createRectangle(100, 100), width: 10, height: 10 };
    const merged = getElementsBounds([a, b])!;
    expect(merged.minX).toBe(0);
    expect(merged.maxX).toBe(110);
  });

  it("hit tests a rectangle with padding", () => {
    const rect = { ...createRectangle(0, 0), width: 100, height: 100 };
    expect(hitTestElement(50, 50, rect)).toBe(true);
    expect(hitTestElement(-3, -3, rect)).toBe(true); // within padding
    expect(hitTestElement(-50, -50, rect)).toBe(false);
  });

  it("hit tests a diamond using its rotated-square boundary", () => {
    const diamond = { ...createRectangle(0, 0), type: "diamond" as const, width: 100, height: 100 };
    // Center should always hit
    expect(hitTestElement(50, 50, diamond)).toBe(true);
    // Corner of the bounding box is outside the diamond
    expect(hitTestElement(2, 2, diamond)).toBe(false);
    // Midpoint of the top edge of the diamond should hit
    expect(hitTestElement(50, 5, diamond)).toBe(true);
  });

  it("detects intersection with a selection rectangle", () => {
    const rect = { ...createRectangle(0, 0), width: 100, height: 100 };
    expect(
      elementIntersectsRect(rect, { minX: 50, minY: 50, maxX: 200, maxY: 200 })
    ).toBe(true);
    expect(
      elementIntersectsRect(rect, { minX: 500, minY: 500, maxX: 600, maxY: 600 })
    ).toBe(false);
  });

  it("converts between screen and world space consistently", () => {
    const camera = { x: 100, y: 50, zoom: 2 };
    const world = screenToWorld(200, 100, camera);
    const screen = worldToScreen(world.x, world.y, camera);
    expect(screen.x).toBeCloseTo(200);
    expect(screen.y).toBeCloseTo(100);
  });

  it("keeps the cursor point stable when zooming", () => {
    const camera = { x: 0, y: 0, zoom: 1 };
    const before = screenToWorld(400, 300, camera);
    const next = zoomAtPoint(camera, 400, 300, 2);
    const after = screenToWorld(400, 300, next);
    expect(after.x).toBeCloseTo(before.x);
    expect(after.y).toBeCloseTo(before.y);
  });
});

describe("serialization", () => {
  it("round-trips a document through JSON", () => {
    let doc = createEmptyDocument();
    doc = new CreateElementCommand(createRectangle(1, 2)).apply(doc);
    const json = serializeDocument(doc);
    const restored = deserializeDocument(json);
    expect(restored.elements).toHaveLength(1);
    expect(restored.elements[0]?.x).toBe(1);
  });

  it("falls back to an empty document on invalid JSON", () => {
    const restored = deserializeDocument("not json");
    expect(restored.elements).toHaveLength(0);
  });
});
