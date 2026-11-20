"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { apiClient } from "@/services/api-client";

export function useLogout() {
  const { refetch } = useAuth();
  const router = useRouter();
  return async function logout() {
    await apiClient.post("/api/auth/logout");
    window.localStorage.removeItem("whiteboard_ws_token");
    refetch();
    router.push("/");
  };
}
