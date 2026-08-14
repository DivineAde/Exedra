import type { BoardDocument, BoardElement } from "../elements/types";
import type { Command } from "./types";

export class CreateElementCommand implements Command {
  type = "CREATE_ELEMENT" as const;
  constructor(private element: BoardElement) {}

  apply(doc: BoardDocument): BoardDocument {
    return {
      ...doc,
      elements: [...doc.elements, this.element],
      version: doc.version + 1,
    };
  }

  invert(): Command {
    return new DeleteElementCommand(this.element.id);
  }
}

// imported lazily to avoid circular init order issues
import { DeleteElementCommand } from "./delete-element";
