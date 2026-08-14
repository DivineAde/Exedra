import type { BoardDocument } from "@whiteboard/editor-core";

export type BoardRole = "OWNER" | "EDITOR" | "VIEWER";

export interface BoardSummaryDTO {
  id: string;
  name: string;
  ownerId: string;
  role: BoardRole;
  updatedAt: string;
  createdAt: string;
  thumbnailUrl: string | null;
}

export interface BoardDTO extends BoardSummaryDTO {
  document: BoardDocument;
  version: number;
}

export interface BoardMemberDTO {
  id: string;
  boardId: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: BoardRole;
}

export interface CreateBoardInput {
  name: string;
  document?: BoardDocument;
}

export interface UpdateBoardInput {
  name?: string;
  document?: BoardDocument;
  expectedVersion?: number;
}
