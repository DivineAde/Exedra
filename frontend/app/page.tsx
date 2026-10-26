"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { PenTool, Users, Zap, Github, Heart } from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container absolute top-0 left-0 right-0 z-20 flex h-20 items-center justify-between">
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

      {/* Hero Section */}
      <section className="hero-page relative flex min-h-[100dvh] flex-col justify-center overflow-hidden px-5 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
        {/* Background Orbs & Grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl" aria-hidden="true" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl" aria-hidden="true" />
          
        </div>

        {/* Sticker Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block" aria-hidden="true">
          {/* Sunflower / Badge 
          <div className="absolute" style={{ left: "74%", top: "12%", width: "clamp(5.6rem, 10.8vw, 8.8rem)", transform: "rotate(6deg)", zIndex: 1 }}>
            <StickerFrame alt="Sunflower sticker" src="/stickers/sunflower-badge.webp" />
          </div>
          */}
          {/* Shooting Star */}
          <div className="absolute" style={{ left: "9%", top: "12%", width: "clamp(4.4rem, 8.8vw, 7.4rem)", transform: "rotate(-7deg)", zIndex: 1 }}>
            <StickerFrame alt="Shooting star sticker" src="/shooting-star-badge.webp" />
          </div>
          {/* Pineapple / Watermelon */}
          <div className="absolute" style={{ left: "77%", top: "70%", width: "clamp(5.4rem, 11.2vw, 9.1rem)", transform: "rotate(7deg)", zIndex: 1 }}>
            <StickerFrame alt="Pineapple sticker" src="/sunflower-badge.webp" />
          </div>
          {/* Donut 
          <div className="absolute" style={{ left: "16%", top: "73%", width: "clamp(4.9rem, 9.6vw, 8rem)", transform: "rotate(-8deg)", zIndex: 1 }}>
            <StickerFrame alt="Donut sticker" src="/stickers/donut.webp" />
          </div>
          */}
          {/* Lollipop 
          <div className="absolute" style={{ left: "80%", top: "45%", width: "clamp(4.1rem, 8vw, 6.5rem)", transform: "rotate(12deg)", zIndex: 1 }}>
            <StickerFrame alt="Lollipop sticker" src="/stickers/lollipop.webp" />
          </div>
          */}
          {/* Leaf 
          <div className="absolute" style={{ left: "11%", top: "47%", width: "clamp(4rem, 7.8vw, 6.2rem)", transform: "rotate(-11deg)", zIndex: 1 }}>
            <StickerFrame alt="Leaf sticker" src="/stickers/leaf.webp" />
          </div>
          */}
        </div>

        {/* Main Hero Content */}
        <div className="relative z-[1] mx-auto w-full max-w-3xl text-center sm:text-left mt-12">
          <div className="rise-in">
            <h1 className="mb-4 font-serif font-bold tracking-tight text-5xl lg:text-6xl text-balance text-foreground leading-[1.1] sm:mb-10 lg:mb-12">
              Design in the browser,<br />openly.
            </h1>
            <p className="mb-5 max-w-xl text-lg leading-[1.6] text-muted-foreground sm:mb-12 sm:text-xl sm:leading-[1.55] lg:text-[1.375rem] lg:leading-[1.5]">
              Exedra is an open canvas for layouts, and .
            </p>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
              <Button asChild size="lg" className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 rounded-full px-10 py-4 h-auto text-base font-medium">
                <Link href={user ? "/dashboard" : "/editor"}>Open editor</Link>
              </Button>
              
              <Button variant="outline" asChild size="lg" className="rounded-full border-black/[0.14] bg-white/85 dark:bg-background/85 px-8 py-4 h-auto text-base font-medium backdrop-blur-sm hover:border-black/[0.22] hover:bg-white">
                <Link href="https://divineade.vercel.app">My Portfolio</Link>
              </Button>

              <Button variant="outline" asChild size="lg" className="rounded-full border-black/[0.14] bg-white/70 dark:bg-background/70 px-8 py-4 h-auto text-base font-medium backdrop-blur-sm hover:border-black/[0.22] hover:bg-white">
                <Link href="https://github.com/DivineAde/Exedra" target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" /> GitHub
                </Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-muted-foreground">
              <span>Want to back the project?</span>
              <Link 
                href="https://paystack.shop/pay/3jsxjg6haj" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.1] bg-white/70 dark:bg-background/70 px-4 py-2 font-medium text-foreground no-underline backdrop-blur-sm hover:border-black/[0.18] hover:bg-white transition-all"
              >
                <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> Sponsor Exedra
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StickerFrame({ alt, src }: { alt: string; src: string }) {
  return (
    <div className="relative group select-none">
      {/* Selection Border Box */}
      <span className="absolute inset-[-4px] border border-blue-500/60 pointer-events-none hidden group-hover:block" />
      
      {/* Handles */}
      <span className="absolute -top-1.5 -left-1.5 w-2 h-2 bg-white border border-blue-500 hidden group-hover:block z-10" />
      <span className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-white border border-blue-500 hidden group-hover:block z-10" />
      <span className="absolute -bottom-1.5 -right-1.5 w-2 h-2 bg-white border border-blue-500 hidden group-hover:block z-10" />
      <span className="absolute -bottom-1.5 -left-1.5 w-2 h-2 bg-white border border-blue-500 hidden group-hover:block z-10" />

      <img
        alt={alt}
        className="w-full h-auto drop-shadow-md pointer-events-none"
        loading="lazy"
        decoding="async"
        draggable="false"
        src={src}
      />
    </div>
  );
}

function Feature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border bg-card p-6 text-left sm:items-start shadow-sm">
      <div className="rounded-md bg-accent p-2 text-accent-foreground">{icon}</div>
      <h3 className="font-medium text-base">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}