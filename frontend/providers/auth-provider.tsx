"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import type { UserDTO } from "@whiteboard/shared-types";

interface AuthContextValue {
  user: UserDTO | null;
  isLoading: boolean;
  refetch: () => void;
}

const AuthContext = React.createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  refetch: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiClient.get<UserDTO>("/api/auth/me"),
    retry: false,
    // Auth is optional context; failures (401) just mean "logged out",
    // rather than an unrecoverable query error.
    throwOnError: false,
  });

  return (
    <AuthContext.Provider value={{ user: data ?? null, isLoading, refetch: () => refetch() }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}
