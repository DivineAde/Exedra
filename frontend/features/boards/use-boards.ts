"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import type { BoardSummaryDTO, BoardDTO } from "@whiteboard/shared-types";
import { toast } from "sonner";

export function useBoards() {
  return useQuery({
    queryKey: ["boards"],
    queryFn: () => apiClient.get<BoardSummaryDTO[]>("/api/boards"),
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => apiClient.post<BoardDTO>("/api/boards", { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
    onError: () => toast.error("Couldn't create the board. Please try again."),
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (boardId: string) => apiClient.delete(`/api/boards/${boardId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      toast.success("Board deleted");
    },
    onError: () => toast.error("Couldn't delete the board."),
  });
}

export function useDuplicateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (boardId: string) => apiClient.post<BoardDTO>(`/api/boards/${boardId}/duplicate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      toast.success("Board duplicated");
    },
    onError: () => toast.error("Couldn't duplicate the board."),
  });
}

export function useRenameBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ boardId, name }: { boardId: string; name: string }) =>
      apiClient.patch<BoardDTO>(`/api/boards/${boardId}`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
    onError: () => toast.error("Couldn't rename the board."),
  });
}
