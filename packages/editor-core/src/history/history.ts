import type { BoardDocument } from "../elements/types";
import type { Command } from "../commands/types";

const MAX_HISTORY = 200;

/** Command-based undo/redo stack. Each entry is a small reversible
 * command rather than a full document snapshot, so history stays cheap
 * even on large boards. */
export class HistoryManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];

  execute(command: Command, doc: BoardDocument): BoardDocument {
    const next = command.apply(doc);
    const inverse = command.invert(doc);
    this.undoStack.push(inverse);
    if (this.undoStack.length > MAX_HISTORY) this.undoStack.shift();
    this.redoStack = [];
    return next;
  }

  undo(doc: BoardDocument): BoardDocument | null {
    const command = this.undoStack.pop();
    if (!command) return null;
    const next = command.apply(doc);
    const redoCommand = command.invert(doc);
    this.redoStack.push(redoCommand);
    return next;
  }

  redo(doc: BoardDocument): BoardDocument | null {
    const command = this.redoStack.pop();
    if (!command) return null;
    const next = command.apply(doc);
    const undoCommand = command.invert(doc);
    this.undoStack.push(undoCommand);
    return next;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
