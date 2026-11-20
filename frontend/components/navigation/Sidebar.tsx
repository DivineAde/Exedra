"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { LayoutGrid, Clock, Users, Settings, PanelLeftClose, PanelLeftOpen, Plus, Loader2, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { UserMenu } from "./UserMenu";
import { Skeleton } from "@/components/ui/skeleton";
import { useBoards } from "@/features/boards/use-boards";
import { useCreateAndOpenBoard } from "@/components/boards/CreateBoardButton";
import { useAuth } from "@/providers/auth-provider";
import { useUiStore } from "@/stores/ui-store";
import { isRecent, sortBoards } from "@/features/boards/board-filters";
import { boardHue } from "@/components/boards/BoardThumbnail";

const COLLAPSE_KEY = "exedra:sidebar-collapsed";

function SidebarBody({ collapsed, onNavigate, onToggle }: { collapsed: boolean; onNavigate?: () => void; onToggle?: () => void }) {
  const pathname = usePathname();
  const filter = useSearchParams().get("filter");
  const { data: boards, isLoading } = useBoards();
  const { user, isLoading: authLoading } = useAuth();
  const { create, isPending } = useCreateAndOpenBoard();

  const items = [
    { href: "/dashboard", match: pathname === "/dashboard" && !filter, label: "All boards", icon: LayoutGrid, count: boards?.length },
    { href: "/dashboard?filter=recent", match: pathname === "/dashboard" && filter === "recent", label: "Recent", icon: Clock, count: boards?.filter((b) => isRecent(b)).length },
    { href: "/dashboard?filter=shared", match: pathname === "/dashboard" && filter === "shared", label: "Shared with me", icon: Users, count: boards?.filter((b) => b.role !== "OWNER").length },
  ];
  const settingsActive = pathname === "/settings";
  const jumpBack = sortBoards(boards ?? [], "edited").slice(0, 5);

  // Active item: a solid ink pill (black in light mode, white in dark mode).
  const linkClass = (active: boolean) =>
    cn(
      "group relative flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      collapsed && "justify-center px-0",
      active ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
    );

  return (
    <div className="flex h-full flex-col gap-4 p-3">
      <div className={cn("flex h-10 items-center", collapsed ? "justify-center" : "justify-between pl-1.5")}>
        <Link href="/dashboard" onClick={onNavigate} aria-label="Exedra home" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {collapsed ? <LogoMark /> : <Logo />}
        </Link>
        {!collapsed && onToggle && (
          <button
            onClick={onToggle}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      <button
        onClick={() => {
          create();
          onNavigate?.();
        }}
        disabled={isPending}
        title="New board"
        className={cn(
          "flex h-10 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground shadow-[inset_0_-2px_0_hsl(0_0%_0%/0.2),0_1px_2px_hsl(0_0%_0%/0.2)] transition-[background-color,transform] hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
          collapsed ? "justify-center px-0" : "justify-start"
        )}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        {!collapsed && "New board"}
      </button>

      <nav aria-label="Primary" className="flex flex-col gap-0.5">
        {items.map((item) => (
          <Link key={item.href} href={item.href} onClick={onNavigate} title={collapsed ? item.label : undefined} aria-current={item.match ? "page" : undefined} className={linkClass(item.match)}>
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 truncate">{item.label}</span>
                {isLoading ? (
                  <Skeleton className="h-4 w-5 rounded" />
                ) : (
                  <span className={cn("text-xs tabular-nums", item.match ? "text-background/70" : "text-muted-foreground")}>{item.count ?? 0}</span>
                )}
              </>
            )}
          </Link>
        ))}
      </nav>

      {!collapsed && (isLoading || jumpBack.length > 0) && (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <p className="mb-1.5 px-2.5 text-xs font-medium text-muted-foreground">Jump back in</p>
          <ul className="flex flex-col gap-0.5">
            {isLoading
              ? [0, 1, 2].map((i) => (
                  <li key={i} className="flex h-8 items-center gap-3 px-2.5">
                    <Skeleton className="h-2.5 w-2.5 rounded-full" />
                    <Skeleton className="h-3 flex-1" />
                  </li>
                ))
              : jumpBack.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/boards/${b.id}`}
                      onClick={onNavigate}
                      className="flex h-8 items-center gap-3 rounded-lg px-2.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: `hsl(${boardHue(b.id)} 65% 58%)` }} />
                      <span className="truncate">{b.name}</span>
                    </Link>
                  </li>
                ))}
          </ul>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-1">
        {collapsed && onToggle && (
          <button
            onClick={onToggle}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className="flex h-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}
        <Link href="/settings" onClick={onNavigate} title={collapsed ? "Settings" : undefined} aria-current={settingsActive ? "page" : undefined} className={linkClass(settingsActive)}>
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && "Settings"}
        </Link>
        <div className="my-1 h-px bg-border" />
        {authLoading ? (
          <div className="flex items-center gap-3 p-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            {!collapsed && (
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            )}
          </div>
        ) : user ? (
          <UserMenu variant="card" collapsed={collapsed} />
        ) : (
          <Link href="/login" className={linkClass(false)} title="Log in">
            <LogIn className="h-4 w-4 shrink-0" />
            {!collapsed && "Log in"}
          </Link>
        )}
      </div>
    </div>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { mobileNavOpen, setMobileNavOpen } = useUiStore();
  const pathname = usePathname();

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {}
  }, []);

  // Close the drawer whenever the route changes.
  useEffect(() => setMobileNavOpen(false), [pathname, setMobileNavOpen]);

  function toggle() {
    setCollapsed((c) => {
      try {
        window.localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      } catch {}
      return !c;
    });
  }

  return (
    <>
      <aside
        className={cn(
          "hidden shrink-0 border-r bg-sidebar transition-[width] duration-200 ease-out md:block",
          collapsed ? "w-[68px]" : "w-[264px]"
        )}
      >
        <SidebarBody collapsed={collapsed} onToggle={toggle} />
      </aside>

      <DialogPrimitive.Root open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] animate-fade-in md:hidden" />
          <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 w-[280px] border-r bg-sidebar shadow-2xl animate-in slide-in-from-left duration-200 focus:outline-none md:hidden">
            <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
            <SidebarBody collapsed={false} onNavigate={() => setMobileNavOpen(false)} />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
