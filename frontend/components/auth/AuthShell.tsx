import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

function Cursor({ name, hue, className }: { name: string; hue: number; className: string }) {
  const color = `hsl(${hue} 75% 55%)`;
  return (
    <div className={className} aria-hidden="true">
      <svg width="20" height="22" viewBox="0 0 20 22" fill={color} stroke="white" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M2 2l15 8-6.5 1.8L8 18.5z" />
      </svg>
      <span className="ml-3 -mt-0.5 block w-fit rounded-full px-2 py-0.5 text-xs font-medium text-white shadow-sm" style={{ background: color }}>
        {name}
      </span>
    </div>
  );
}

/** Right-hand panel: a small live board, to show what's on the other side of
 * the form. Decorative only. */
function Showcase() {
  const ink = "currentColor";
  const gray = "hsl(240 6% 50% / 0.6)";
  return (
    <div className="relative hidden overflow-hidden border-l bg-dots bg-muted/50 lg:block" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.04] via-transparent to-transparent" />
      <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
        <div>
          <p className="font-display text-4xl font-semibold leading-[1.1] xl:text-5xl">
            Sketch it together,
            <br />
            while it&apos;s still an idea.
          </p>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">
            Shapes, freehand and text on an infinite canvas. Everyone&apos;s cursor, live.
          </p>
        </div>

        <div className="relative mx-auto aspect-[4/3] w-full max-w-xl">
          <svg viewBox="0 0 480 340" className="h-full w-full" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="24" y="130" width="120" height="68" rx="12" fill="hsl(var(--foreground) / 0.06)" stroke={ink} />
            <text x="84" y="170" textAnchor="middle" fontSize="16" fontWeight="600" fill="currentColor" stroke="none" className="font-sans">Idea</text>
            <path d="M144 164C166 160 178 168 200 164" stroke={gray} />
            <path d="M192 156l10 8-10 8" stroke={gray} />
            <path d="M262 112l60 52-60 52-60-52z" stroke={ink} />
            <text x="262" y="170" textAnchor="middle" fontSize="15" fontWeight="600" fill="currentColor" stroke="none" className="font-sans">Ship it?</text>
            <path d="M322 164C344 168 356 160 376 164" stroke={gray} />
            <path d="M368 156l10 8-10 8" stroke={gray} />
            <ellipse cx="420" cy="164" rx="44" ry="34" fill="hsl(var(--foreground) / 0.06)" stroke={ink} />
            <text x="420" y="170" textAnchor="middle" fontSize="16" fontWeight="600" fill="currentColor" stroke="none" className="font-sans">Demo</text>
            <path d="M262 216C262 262 200 274 150 262" stroke={gray} strokeDasharray="2 8" />
            <path d="M64 70c30-34 56 26 88-6s46-22 74-8" stroke="hsl(25 85% 58%)" strokeWidth="3" />
          </svg>
          <Cursor name="Ada" hue={255} className="absolute left-[24%] top-[26%] animate-cursor-a" />
          <Cursor name="Tobi" hue={160} className="absolute left-[62%] top-[64%] animate-cursor-b" />
        </div>
      </div>
    </div>
  );
}

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link href="/" aria-label="Exedra home" className="w-fit rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Logo />
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="font-display text-3xl font-semibold">{title}</h1>
          <p className="mb-8 mt-2 text-sm text-muted-foreground">{subtitle}</p>
          {children}
          <p className="mt-8 text-sm text-muted-foreground">{footer}</p>
        </div>
        <Link href="/editor" className="w-fit text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          Or try the canvas without an account
        </Link>
      </div>
      <Showcase />
    </div>
  );
}
