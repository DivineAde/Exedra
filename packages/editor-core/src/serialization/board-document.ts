import type { BoardDocument } from "../elements/types";
import { createEmptyDocument } from "../elements/types";

export function serializeDocument(doc: BoardDocument): string {
  return JSON.stringify(doc);
}

export function deserializeDocument(json: string): BoardDocument {
  try {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.elements)) {
      return createEmptyDocument();
    }
    return {
      elements: parsed.elements,
      backgroundColor: parsed.backgroundColor ?? "#ffffff",
      version: typeof parsed.version === "number" ? parsed.version : 0,
    };
  } catch {
    return createEmptyDocument();
  }
}

/** Export the current selection (or the whole board) as a standalone document,
 * used for PNG/SVG/JSON export and for copy/paste across boards. */
export function extractSubDocument(
  doc: BoardDocument,
  elementIds: string[] | null
): BoardDocument {
  if (!elementIds || elementIds.length === 0) return doc;
  const idSet = new Set(elementIds);
  return {
    ...doc,
    elements: doc.elements.filter((e) => idSet.has(e.id)),
  };
}
