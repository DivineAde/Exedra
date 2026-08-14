import type { BoardDocument, BoardElement } from "../elements/types";
import type { Command } from "./types";

export class DeleteElementCommand implements Command {
  type = "DELETE_ELEMENT" as const;
  private removed: BoardElement | undefined;

  constructor(private elementId: string) {}

  apply(doc: BoardDocument): BoardDocument {
    this.removed = doc.elements.find((e) => e.id === this.elementId);
    return {
      ...doc,
      elements: doc.elements.filter((e) => e.id !== this.elementId),
      version: doc.version + 1,
    };
  }

  invert(): Command {
    if (!this.removed) {
      throw new Error("Cannot invert delete before apply() has run");
    }
    return new CreateElementCommand(this.removed);
  }
}

import { CreateElementCommand } from "./create-element";
