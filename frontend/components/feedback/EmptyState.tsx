import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Custom action node (e.g. a button that creates a board). */
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, action }: EmptyStateProps) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-dashed bg-dots px-6 py-20 text-center">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/0 via-background/70 to-background" aria-hidden="true" />
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border bg-card text-foreground shadow-sm">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="relative font-display text-xl font-semibold">{title}</h3>
      <p className="relative max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action ?? (actionLabel && onAction && (
        <Button onClick={onAction} className="relative mt-2">
          {actionLabel}
        </Button>
      ))}
    </div>
  );
}
