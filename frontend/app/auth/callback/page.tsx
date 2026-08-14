"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { migrateGuestBoardIfPresent } from "@/features/boards/guest-migration";
import { FullPageLoading } from "@/components/feedback/LoadingState";
import { toast } from "sonner";

/**
 * Landing page for the Google OAuth redirect. The backend puts the session
 * token in a URL *fragment* (`#token=...`), not a query string, so it's
 * never sent to the server or captured in access logs -- only this
 * client-side script ever reads it. From here: store the token, migrate
 * any local guest board into the new account, then continue in.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
    const params = new URLSearchParams(hash);
    const token = params.get("token");

    if (!token) {
      setError("Sign-in didn't complete. Please try again.");
      return;
    }

    window.localStorage.setItem("whiteboard_ws_token", token);
    // Clear the fragment so the token doesn't linger in browser history.
    window.history.replaceState(null, "", "/auth/callback");

    refetch();
    toast.success("Signed in with Google");

    migrateGuestBoardIfPresent()
      .catch(() => null)
      .then((boardId) => {
        router.replace(boardId ? `/boards/${boardId}` : "/dashboard");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">{error}</p>
        <a href="/login" className="text-sm font-medium text-primary hover:underline">
          Back to login
        </a>
      </div>
    );
  }

  return <FullPageLoading />;
}
