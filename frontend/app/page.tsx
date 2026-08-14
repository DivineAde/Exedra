"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { PenTool, Users, Zap } from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <PenTool className="h-5 w-5 text-primary" />
          Exedra
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!isLoading && user ? (
            <Button asChild>
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign up free</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="container flex flex-1 flex-col items-center justify-center gap-8 py-20 text-center">
        <h1 className="max-w-2xl text-5xl font-semibold tracking-tight">
          Sketch ideas together, in real time.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          An infinite canvas for diagrams, flows, and rough ideas — with your team,
          live, from anywhere.
        </p>
        <div className="flex gap-3">
          <Button size="lg" asChild>
            <Link href={user ? "/dashboard" : "/editor"}>Start whiteboarding</Link>
          </Button>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          <Feature icon={<Zap className="h-5 w-5" />} title="Fast" description="60fps canvas, even on huge boards." />
          <Feature icon={<Users className="h-5 w-5" />} title="Collaborative" description="See teammates' cursors live." />
          <Feature icon={<PenTool className="h-5 w-5" />} title="Focused" description="Just the tools you actually use." />
        </div>
      </main>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border bg-card p-6 text-left sm:items-start">
      <div className="rounded-md bg-accent p-2 text-accent-foreground">{icon}</div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
