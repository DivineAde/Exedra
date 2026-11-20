import { cn } from "@/lib/utils";

/** Exedra mark: a semicircular recess (the architectural exedra) with a
 * single drawn stroke through it. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-primary text-primary-foreground shadow-[inset_0_-2px_0_hsl(0_0%_0%/0.18),0_1px_2px_hsl(0_0%_0%/0.25)]",
        className
      )}
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 17a8 8 0 0 1 16 0" />
        <path d="M8.5 17.5c1.2-2.4 2.4-3.6 3.5-3.6s2.3 1.2 3.5 3.6" opacity="0.7" />
        <path d="M3 20.5h18" />
      </svg>
    </span>
  );
}

export function Logo({ className, showWord = true }: { className?: string; showWord?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {showWord && <span className="font-display text-[19px] font-semibold leading-none">Exedra</span>}
    </span>
  );
}
