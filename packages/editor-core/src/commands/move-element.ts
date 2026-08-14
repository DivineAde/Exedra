import type { BoardDocument } from "../elements/types";
import type { Command } from "./types";

export class MoveElementCommand implements Command {
  type = "MOVE_ELEMENT" as const;

  constructor(
    private elementIds: string[],
    private dx: number,
    private dy: number
  ) {}

  apply(doc: BoardDocument): BoardDocument {
    const idSet = new Set(this.elementIds);
    const elements = doc.elements.map((el) =>
      idSet.has(el.id)
        ? { ...el, x: el.x + this.dx, y: el.y + this.dy, updatedAt: Date.now() }
        : el
    );
    return { ...doc, elements, version: doc.version + 1 };
  }

  invert(): Command {
    return new MoveElementCommand(this.elementIds, -this.dx, -this.dy);
  }
}
