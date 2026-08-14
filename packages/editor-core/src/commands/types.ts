import type { BoardDocument } from "../elements/types";

/** Every mutation to the document is expressed as a reversible Command.
 * This is the foundation of the undo/redo system: instead of snapshotting
 * the whole document on every change, we store small, typed diffs. */
export interface Command {
  type: string;
  apply(doc: BoardDocument): BoardDocument;
  invert(doc: BoardDocument): Command;
}
