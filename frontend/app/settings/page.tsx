"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuth } from "@/providers/auth-provider";
import { FullPageLoading } from "@/components/feedback/LoadingState";

export default function SettingsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <FullPageLoading />;
  if (!user) return null;

  const initials = user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <DashboardLayout>
      <TopNavigation />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <h1 className="mb-8 text-2xl font-semibold">Settings</h1>

        <section className="mb-8 flex items-center gap-4 rounded-lg border bg-card p-6">
          <Avatar className="h-14 w-14">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </section>

        <section className="mb-8 flex flex-col gap-4 rounded-lg border bg-card p-6">
          <h2 className="font-medium">Profile</h2>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue={user.name} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" defaultValue={user.email} disabled />
          </div>
          <Button className="w-fit">Save changes</Button>
        </section>

        <section className="flex items-center justify-between rounded-lg border bg-card p-6">
          <div>
            <h2 className="font-medium">Appearance</h2>
            <p className="text-sm text-muted-foreground">Switch between light, dark, or system theme.</p>
          </div>
          <ThemeToggle />
        </section>
      </main>
    </DashboardLayout>
  );
}
