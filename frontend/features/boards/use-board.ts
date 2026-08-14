"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import type { BoardDTO } from "@whiteboard/shared-types";

export function useBoard(boardId: string) {
  return useQuery({
    queryKey: ["board", boardId],
    queryFn: () => apiClient.get<BoardDTO>(`/api/boards/${boardId}`),
    retry: false,
  });
}
