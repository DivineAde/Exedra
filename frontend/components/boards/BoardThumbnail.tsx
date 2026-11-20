import { cn } from "@/lib/utils";

/** Deterministic hand-sketched preview for a board, derived from its id.
 * Boards don't have rendered thumbnails yet (thumbnailUrl is null), and a
 * letter on a gradient says nothing about what's inside. Five layouts
 * (flowchart, mind map, wireframe, kanban, scribble) keep a grid of boards
 * visually distinct and scannable. */

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const HUES = [255, 200, 160, 25, 335];

export function boardHue(id: string) {
  return HUES[(hash(id) >>> 3) % HUES.length];
}

export function BoardThumbnail({ id, className }: { id: string; className?: string }) {
  const seed = hash(id);
  const r = rng(seed);
  const layout = seed % 5;
  const hue = HUES[(seed >>> 3) % HUES.length];
  const ink = `hsl(${hue} 65% 58%)`;
  const tint = `hsl(${hue} 80% 60% / 0.13)`;
  const gray = "hsl(240 6% 55% / 0.55)";
  const j = (n = 4) => (r() - 0.5) * n;
  const common = { strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  let shapes: React.ReactNode;
  if (layout === 0) {
    shapes = (
      <g transform="translate(-8 0)">
        <rect x={28 + j()} y={86 + j()} width={72} height={48} rx={8} fill={tint} stroke={ink} {...common} />
        <path d={`M100 110 C 116 ${108 + j()}, 124 ${112 + j()}, 140 110`} stroke={gray} fill="none" {...common} />
        <path d="M134 104 L142 110 L134 116" stroke={gray} fill="none" {...common} />
        <path d={`M${180 + j()} 80 L220 110 L180 140 L140 110 Z`} fill="none" stroke={ink} {...common} />
        <path d="M220 110 C 236 108, 244 112, 258 110" stroke={gray} fill="none" {...common} />
        <ellipse cx={282} cy={110} rx={28} ry={22} fill={tint} stroke={ink} {...common} />
        <path d="M44 106h40M44 118h24" stroke={gray} {...common} />
      </g>
    );
  } else if (layout === 1) {
    const sats = [[70, 50], [250, 54], [64, 170], [258, 168]];
    shapes = (
      <>
        {sats.map(([x, y], i) => (
          <path key={i} d={`M160 110 Q ${(160 + x) / 2 + j(16)} ${(110 + y) / 2 + j(16)} ${x} ${y}`} stroke={gray} fill="none" {...common} />
        ))}
        <ellipse cx={160} cy={110} rx={38} ry={26} fill={tint} stroke={ink} {...common} />
        {sats.map(([x, y], i) => (
          <rect key={i} x={x - 26} y={y - 14} width={52} height={28} rx={14} fill="none" stroke={i % 2 ? gray : ink} {...common} />
        ))}
        <path d="M146 110h28" stroke={ink} {...common} />
      </>
    );
  } else if (layout === 2) {
    shapes = (
      <>
        <rect x={30} y={36} width={260} height={150} rx={10} fill="none" stroke={gray} {...common} />
        <path d="M30 62h260" stroke={gray} {...common} />
        <rect x={46} y={80} width={112} height={88} rx={6} fill={tint} stroke={ink} {...common} />
        <path d="M46 168L90 128L118 150L134 136L158 160" stroke={ink} fill="none" {...common} />
        <path d="M178 88h90M178 106h70M178 124h82" stroke={gray} {...common} />
        <rect x={178} y={142} width={64} height={26} rx={13} fill={ink} stroke={ink} {...common} />
      </>
    );
  } else if (layout === 3) {
    const cols = [34, 124, 214];
    shapes = (
      <>
        {cols.map((x, c) => (
          <g key={x}>
            <rect x={x} y={32} width={78} height={154} rx={8} fill="none" stroke={gray} {...common} />
            <path d={`M${x + 12} 48h34`} stroke={c === 1 ? ink : gray} {...common} />
            {Array.from({ length: 3 - (c === 2 ? 1 : 0) }).map((_, i) => (
              <rect key={i} x={x + 10} y={64 + i * 40} width={58} height={30} rx={5} fill={i === 0 && c === 1 ? tint : "none"} stroke={i === 0 && c === 1 ? ink : gray} {...common} />
            ))}
          </g>
        ))}
      </>
    );
  } else {
    shapes = (
      <>
        <path d={`M30 ${150 + j()} C 60 ${60 + j(10)}, 90 ${190 + j(10)}, 120 ${110 + j()} S 180 ${50 + j(10)}, 210 ${120 + j()} S 270 ${170 + j(10)}, 292 ${80 + j()}`} fill="none" stroke={ink} {...common} strokeWidth={2.5} />
        <circle cx={78} cy={64} r={22} fill={tint} stroke={ink} {...common} />
        <path d="M220 170l30-26M250 144l-4 20M250 144l-22 -2" stroke={gray} fill="none" {...common} />
        <rect x={160} y={150} width={50} height={36} rx={6} fill="none" stroke={gray} {...common} strokeDasharray="4 6" />
      </>
    );
  }

  return (
    <svg viewBox="0 0 320 220" preserveAspectRatio="xMidYMid slice" className={cn("h-full w-full", className)} aria-hidden="true">
      {shapes}
    </svg>
  );
}
