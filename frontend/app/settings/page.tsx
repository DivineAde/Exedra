"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Keyboard, LogOut, Monitor, Moon, Sun } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { KeyboardShortcutsDialog } from "@/components/dialogs/KeyboardShortcutsDialog";
import { SettingsSkeleton } from "@/components/feedback/LoadingState";
import { getInitials } from "@/components/navigation/UserMenu";
import { useAuth } from "@/providers/auth-provider";
import { useLogout } from "@/hooks/use-logout";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import Link from "next/link";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-5 border-t py-8 md:grid-cols-[220px_1fr] md:gap-10">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div>{children}</div>
    </section>
  );
}

function ThemePreview({ mode }: { mode: "light" | "dark" | "system" }) {
  const pane = (dark: boolean) => (
    <div className={cn("flex h-full flex-1 flex-col gap-1.5 p-2", dark ? "bg-[hsl(240_10%_10%)]" : "bg-white")}>
      <div className={cn("h-1.5 w-8 rounded-full", dark ? "bg-white/40" : "bg-black/20")} />
      <div className={cn("h-1.5 w-12 rounded-full", dark ? "bg-white/80" : "bg-black/80")} />
      <div className={cn("mt-auto h-4 w-full rounded", dark ? "bg-white/10" : "bg-black/[0.06]")} />
    </div>
  );
  return (
    <div className="flex h-16 overflow-hidden rounded-lg border">
      {mode === "system" ? (
        <>
          {pane(false)}
          {pane(true)}
        </>
      ) : (
        pane(mode === "dark")
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const logout = useLogout();
  const setShortcutsOpen = useUiStore((s) => s.setShortcutsDialogOpen);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <DashboardLayout>
      <TopNavigation title="Settings" />
      <main className="flex-1 overflow-y-auto">
        {isLoading ? (
          <SettingsSkeleton />
        ) : !user ? (
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-8">
            <h1 className="font-display text-2xl font-semibold">Log in to see your settings</h1>
            <Button asChild className="mt-5">
              <Link href="/login">Log in</Link>
            </Button>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8">
            <h1 className="font-display text-3xl font-semibold">Settings</h1>
            <p className="mb-8 mt-1.5 text-sm text-muted-foreground">Your account and how Exedra looks on this device.</p>

            <Section title="Account" description="The name and email on your boards and in collaborators' avatars.">
              <div className="flex items-center gap-4 rounded-2xl border bg-card p-4">
                <Avatar className="h-14 w-14 border-0 ring-1 ring-border">
                  {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                  <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <dl className="min-w-0">
                  <dt className="sr-only">Name</dt>
                  <dd className="truncate font-display text-lg font-semibold leading-tight">{user.name}</dd>
                  <dt className="sr-only">Email</dt>
                  <dd className="truncate text-sm text-muted-foreground">{user.email}</dd>
                </dl>
              </div>
            </Section>

            <Section title="Appearance" description="Choose a theme, or follow your device.">
              <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-3">
                {THEMES.map(({ value, label, icon: Icon }) => {
                  const active = mounted && theme === value;
                  return (
                    <button
                      key={value}
                      role="radio"
                      aria-checked={active}
                      onClick={() => setTheme(value)}
                      className={cn(
                        "rounded-xl border p-2 text-left transition-[border-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active ? "border-foreground shadow-[0_0_0_1px_hsl(var(--foreground))]" : "hover:border-foreground/30"
                      )}
                    >
                      <ThemePreview mode={value} />
                      <span className="mt-2 flex items-center gap-1.5 px-0.5 text-sm font-medium">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" /> {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section title="Keyboard" description="Every tool has a shortcut. Press ? anywhere in the editor to see them.">
              <Button variant="outline" onClick={() => setShortcutsOpen(true)}>
                <Keyboard className="h-4 w-4" /> View shortcuts
              </Button>
            </Section>

            <Section title="Session" description="Log out of Exedra on this device.">
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4" /> Log out
              </Button>
            </Section>
          </div>
        )}
      </main>
      <KeyboardShortcutsDialog />
    </DashboardLayout>
  );
}
