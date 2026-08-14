import { nanoid } from "nanoid";
import type { BoardDocument, BoardElement } from "../elements/types";
import type { Command } from "./types";
import { DeleteElementCommand } from "./delete-element";

const OFFSET = 16;

export class DuplicateElementCommand implements Command {
  type = "DUPLICATE_ELEMENT" as const;
  private newIds: string[] = [];

  constructor(private sourceIds: string[]) {}

  apply(doc: BoardDocument): BoardDocument {
    const now = Date.now();
    const clones: BoardElement[] = [];
    for (const el of doc.elements) {
      if (!this.sourceIds.includes(el.id)) continue;
      const clone: BoardElement = {
        ...el,
        id: nanoid(12),
        x: el.x + OFFSET,
        y: el.y + OFFSET,
        createdAt: now,
        updatedAt: now,
      };
      clones.push(clone);
    }
    this.newIds = clones.map((c) => c.id);
    return { ...doc, elements: [...doc.elements, ...clones], version: doc.version + 1 };
  }

  invert(): Command {
    return {
      type: "DELETE_MANY",
      apply: (doc: BoardDocument) => {
        const idSet = new Set(this.newIds);
        return {
          ...doc,
          elements: doc.elements.filter((e) => !idSet.has(e.id)),
          version: doc.version + 1,
        };
      },
      invert: () => new DeleteElementCommand(this.newIds[0] ?? ""),
    };
  }

  get createdIds(): string[] {
    return this.newIds;
  }
}
