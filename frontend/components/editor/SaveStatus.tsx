"use client";

import { Check, Loader2, CloudOff, AlertCircle } from "lucide-react";
import { useUiStore } from "@/stores/ui-store";

const CONFIG = {
  saved: { icon: Check, label: "Saved", className: "text-muted-foreground" },
  saving: { icon: Loader2, label: "Saving...", className: "text-muted-foreground" },
  offline: { icon: CloudOff, label: "Offline", className: "text-amber-600" },
  error: { icon: AlertCircle, label: "Couldn't save", className: "text-destructive" },
} as const;

export function SaveStatus() {
  const status = useUiStore((s) => s.saveStatus);
  const { icon: Icon, label, className } = CONFIG[status];

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${className}`}>
      <Icon className={`h-3.5 w-3.5 ${status === "saving" ? "animate-spin" : ""}`} />
      {label}
    </div>
  );
}
