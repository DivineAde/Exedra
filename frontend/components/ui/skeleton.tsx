import { cn } from "@/lib/utils";

/** Shimmering placeholder. The sweep is a single translated gradient, so it
 * stays cheap even with dozens on screen, and is disabled under
 * prefers-reduced-motion by the global rule in globals.css. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-md bg-foreground/[0.06]",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer",
        "before:bg-gradient-to-r before:from-transparent before:via-background/60 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}
