import type { BoardDocument, BoardElement } from "../elements/types";
import type { Command } from "./types";

export class UpdateElementCommand implements Command {
  type = "UPDATE_ELEMENT" as const;
  private previous: Partial<BoardElement> | undefined;

  constructor(
    private elementId: string,
    private changes: Partial<BoardElement>
  ) {}

  apply(doc: BoardDocument): BoardDocument {
    const elements = doc.elements.map((el) => {
      if (el.id !== this.elementId) return el;
      // capture only the keys we're about to overwrite, for a precise invert
      this.previous = {};
      for (const key of Object.keys(this.changes) as (keyof BoardElement)[]) {
        (this.previous as Record<string, unknown>)[key] = el[key];
      }
      return { ...el, ...this.changes, updatedAt: Date.now() } as BoardElement;
    });
    return { ...doc, elements, version: doc.version + 1 };
  }

  invert(): Command {
    if (!this.previous) {
      throw new Error("Cannot invert update before apply() has run");
    }
    return new UpdateElementCommand(this.elementId, this.previous);
  }
}
