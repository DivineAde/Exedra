"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useUiStore } from "@/stores/ui-store";
import { modifierKeyLabel } from "@/lib/utils";

interface TopNavigationProps {
  onSearch?: (query: string) => void;
  /** Shown instead of the search field on pages with nothing to search. */
  title?: string;
}

export function TopNavigation({ onSearch, title }: TopNavigationProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const [modKey, setModKey] = useState("Ctrl");
  useEffect(() => setModKey(modifierKeyLabel()), []);

  useEffect(() => {
    if (!onSearch) return;
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSearch]);

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur sm:px-8">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </Button>

      {onSearch ? (
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            aria-label="Search boards"
            placeholder="Search boards"
            className="bg-secondary/60 pl-9 pr-14 shadow-none"
            onChange={(e) => onSearch(e.target.value)}
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-md border bg-background px-1.5 py-0.5 font-sans text-[11px] text-muted-foreground sm:block">
            {modKey} K
          </kbd>
        </div>
      ) : (
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
      )}

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
