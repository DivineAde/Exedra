"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";

interface AppConfig {
  googleAuthEnabled: boolean;
}

/** Public, unauthenticated config so the frontend can conditionally show
 * auth options (e.g. hide "Continue with Google" when the backend has no
 * Google OAuth credentials configured) without hardcoding assumptions. */
export function useAppConfig() {
  return useQuery({
    queryKey: ["app-config"],
    queryFn: () => apiClient.get<AppConfig>("/api/config"),
    staleTime: Infinity,
  });
}
