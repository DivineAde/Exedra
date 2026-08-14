"use client";

import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { UserMenu } from "./UserMenu";
import { Search } from "lucide-react";

export function TopNavigation({ onSearch }: { onSearch?: (query: string) => void }) {
  return (
    <div className="flex h-16 items-center justify-between gap-4 border-b px-6">
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search boards..."
          className="pl-9"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <UserMenu />
      </div>
    </div>
  );
}
