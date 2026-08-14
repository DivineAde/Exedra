# Exedra — a collaborative whiteboard

An Excalidraw-inspired, real-time collaborative whiteboard. Draw shapes, sketch
freehand, add text, and see your team's cursors move live — built as a
production-shaped monorepo rather than a single-file demo.

This is not a clone of every Excalidraw feature. It focuses on the ~20% of
functionality people actually reach for: shapes, text, freehand drawing,
selection/move/resize, undo/redo, boards, sharing, realtime collaboration,
and export.

## Features

- **Guest-first**: draw immediately at `/editor` with no account — full toolset,
  undo/redo, styling, and export, persisted locally via IndexedDB. Signing in
  (email/password or Google) migrates that local board into the new account.
- Infinite pan/zoom canvas rendered on `<canvas>` (not a React node per shape)
- Rectangle, diamond, ellipse, line, arrow, freehand, text, and eraser tools
- Text editing: standalone text tool, and double-click-to-edit text bound
  inside rectangles/diamonds/ellipses (centered, wrapped, moves with the shape)
- Selection, multi-select, drag-move, resize, duplicate, copy/paste
- Command-based undo/redo (small reversible diffs, not full-document snapshots),
  with visible, tooltipped, disabled-state-aware Undo/Redo buttons
- Styling: stroke color/style (solid/dashed/dotted), fill, stroke width,
  opacity, sloppiness, edges (sharp/rounded), plus a canvas background
  color picker (persisted as part of the board document)
- Email/password auth **and** Google Sign-In (opt-in via env vars), hashed
  passwords, httpOnly session cookies
- Persistent boards with debounced autosave and optimistic-concurrency saves
- Real-time collaboration over WebSocket: live element sync, presence, cursors
- Sharing with Owner / Editor / Viewer roles, enforced server-side
- PNG / SVG / JSON export
- Light / dark / system theme with proper design tokens, Plus Jakarta Sans
  typeface throughout
- Keyboard shortcuts that work on both macOS and Windows/Linux, smooth
  jitter-free panning (see "Known simplifications" below for the fix details)

## Architecture

```text
whiteboard/
├── frontend/            Next.js app (App Router) — dashboard + editor UI
├── backend/              Fastify API + WebSocket collaboration server
├── database/              Prisma schema, migrations, seed data
├── packages/
│   ├── editor-core/       Framework-free element model, geometry, commands,
│   │                       undo/redo, serialization — the heart of the editor
│   ├── shared-types/       DTOs shared between frontend and backend
│   ├── validation/         Zod schemas shared between frontend and backend
│   └── ui/                 Design-system primitives (shadcn/ui patterns)
├── docker/
├── docker-compose.yml     Postgres + Redis for local dev
└── .github/workflows/     CI: typecheck, lint, test, build
```

### Why this structure

- **`editor-core` has zero React dependency.** Element creation, hit-testing,
  undo/redo, and serialization are plain TypeScript. This keeps the hardest
  logic in this app unit-testable without a DOM, and reusable if the canvas
  renderer is ever swapped out.
- **Canvas elements are never React components.** The renderer walks the
  document and draws directly to a 2D canvas context inside a
  `requestAnimationFrame` loop, reading Zustand state imperatively. Canvas
  drawing never waits on (or triggers) a React re-render.
- **History is command-based, not snapshot-based.** Every mutation
  (`CreateElementCommand`, `MoveElementCommand`, ...) knows how to invert
  itself. This keeps undo/redo cheap even with thousands of elements.
- **Backend logic never lives in Next.js API routes.** All business logic —
  auth, board CRUD, permissions, realtime — is in `backend/`, organized by
  module (`authentication/`, `boards/`, `board-members/`, `collaboration/`),
  each with its own `*.routes.ts`, `*.service.ts`, and mapper.
  Board ownership, roles, and IDs are always re-resolved server-side; never
  trusted from client input.
- **Cursor and pointer movement are never persisted.** They travel over
  WebSocket only, held in an in-memory `RoomManager` on the backend
  (`backend/src/modules/collaboration/room-manager.ts`). Document changes are
  debounced and saved via `PATCH /api/boards/:id`, not per-pointer-event.

## Tech stack

**Frontend** — Next.js 15 (React 18), TypeScript, Tailwind CSS, shadcn/ui-style
primitives, Radix UI, Zustand, TanStack Query, React Hook Form + Zod,
next-themes, Sonner, Plus Jakarta Sans (next/font/google).

**Backend** — Node.js, Fastify, Prisma, PostgreSQL, Redis, WebSocket
(`@fastify/websocket`), JWT + bcrypt, Google OAuth (`@fastify/oauth2`, opt-in).

**Monorepo** — pnpm workspaces + Turborepo.

### Why Next.js 15, not 16

Next 16 is current `latest` on npm, but this project stays on 15 deliberately:
16 defaults to Turbopack for production builds and drops `next lint` in favor
of a separate ESLint CLI flow, both of which change the build/lint pipeline
in ways worth validating on their own before adopting. Next 15 is a safe,
single-major-version step up from the previous 14.2.x baseline, keeps React 18
(no React 19 migration), and this app doesn't touch any of the APIs that
changed between 14 and 15 (it has no Next.js API routes or server components
reading `cookies()`/`headers()`/`params` synchronously — all data fetching is
client-side via TanStack Query against the Fastify backend), so the upgrade
was low-risk. Revisit 16 in its own pass when you're ready to validate
Turbopack against this app's canvas rendering.

## Local setup

> For the full step-by-step (including troubleshooting common install/env
> issues) and a complete production deployment walkthrough, see
> **[DEPLOYMENT.md](./DEPLOYMENT.md)**. The quick version:

Requires Node 18.18+, pnpm 9, and Docker.

```bash
pnpm install
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm db:seed
cp .env.example backend/.env
cp .env.example frontend/.env.local   # only NEXT_PUBLIC_* vars are used here
pnpm dev
```

- Frontend → http://localhost:3000
- Backend → http://localhost:4000
- Seed login → `demo@whiteboard.app` / `password123`

## Environment variables

See `.env.example` at the repo root. Key ones:

| Variable | Used by | Purpose |
|---|---|---|
| `DATABASE_URL` | backend, database | Postgres connection string |
| `REDIS_URL` | backend | Presence/pub-sub (ready for multi-instance scaling) |
| `JWT_SECRET` | backend | Signs session tokens — set a strong value in production |
| `CORS_ORIGIN` | backend | Allowed frontend origin |
| `FRONTEND_URL` | backend | Where to redirect after Google OAuth completes |
| `BACKEND_URL` | backend | Must match the Google OAuth "Authorized redirect URI" |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | backend | Optional — omit both to disable Google Sign-In entirely |
| `NEXT_PUBLIC_API_URL` | frontend | Backend REST base URL |
| `NEXT_PUBLIC_WS_URL` | frontend | Backend WebSocket base URL |
| `STORAGE_*` | backend | S3-compatible endpoint for image uploads |

Never commit real secrets — `.env` is gitignored. Each app reads its own env
file (`backend/.env`, `frontend/.env.local`, `database/.env`) — copy the
relevant variables from the root `.env.example` into each.

### Setting up Google Sign-In

1. Create OAuth credentials at
   [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
   (OAuth client ID → Web application).
2. Add `http://localhost:4000/api/auth/google/callback` as an authorized
   redirect URI (swap in your real backend URL in production).
3. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `backend/.env`.
4. Restart the backend. The frontend's "Continue with Google" button appears
   automatically once `GET /api/config` reports `googleAuthEnabled: true` —
   no frontend env changes needed.

Leave both variables unset to run without Google Sign-In; email/password
auth works either way.

## Guest mode

Visiting `/editor` (the landing page's "Start whiteboarding" button) drops
you straight into a fully working editor with no account — draw, undo/redo,
style, zoom/pan, and export all work immediately. The board is persisted
locally via IndexedDB (`frontend/lib/local-board-store.ts`) so it survives a
refresh, but never touches the backend. Signing in from anywhere in the app
(email/password, register, or Google) automatically uploads that local board
as the new account's first board and clears local storage
(`frontend/features/boards/guest-migration.ts`) — guests never lose work by
creating an account.

## Database

```bash
pnpm db:migrate     # create/apply a migration
pnpm db:seed         # load the demo user + demo board
```

Models: `User`, `Board` (JSONB document + version), `BoardMember` (role:
`OWNER` / `EDITOR` / `VIEWER`), `BoardRevision` (periodic checkpoints for
history/recovery). See `database/prisma/schema.prisma` and
`database/README.md`.

## Running tests

```bash
pnpm test               # all packages
pnpm --filter @whiteboard/editor-core test   # just the editor engine
```

`editor-core`'s command/history/geometry/serialization logic is covered by
unit tests with no DOM or network dependency. Backend integration tests
(auth, permissions, sharing) run against the docker-compose Postgres/Redis
instances — see `backend/README.md`.

## API overview

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/boards
POST   /api/boards
GET    /api/boards/:boardId
PATCH  /api/boards/:boardId          # optimistic concurrency via expectedVersion
DELETE /api/boards/:boardId
POST   /api/boards/:boardId/duplicate

GET    /api/boards/:boardId/members
POST   /api/boards/:boardId/members
PATCH  /api/boards/:boardId/members/:userId
DELETE /api/boards/:boardId/members/:userId

POST   /api/files/presigned-url
GET    /api/health
```

All responses follow `{ success: true, data }` or
`{ success: false, error: { code, message } }`.

## Realtime architecture

One WebSocket connection per browser tab, authenticated via JWT on connect
(`GET /ws?token=...`). A client can join/leave board "rooms"
(`board:join` / `board:leave`); every mutating event
(`element:create/update/delete`) is re-validated against the sender's
server-side role before being broadcast to the rest of the room — a viewer's
socket cannot push edits even if it sends the right message shape.
Presence (`board:presence`) and cursor position (`cursor:update`) are
ephemeral and rebuilt on reconnect; nothing here touches PostgreSQL.
`backend/src/infrastructure/redis` is wired up so `RoomManager` can be
swapped for Redis pub/sub if the backend is horizontally scaled.

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full walkthrough (Railway +
Vercel example, environment variables, CORS/cookie setup, smoke test
checklist, and how to scale the realtime layer past one backend instance).
The short version:

- **Frontend**: any Next.js host (Vercel, etc.) — set `NEXT_PUBLIC_API_URL`
  and `NEXT_PUBLIC_WS_URL` to your deployed backend.
- **Backend**: any Node host that supports long-lived WebSocket connections
  (not classic serverless functions) — set the backend `.env` vars and run
  `pnpm --filter backend build && pnpm --filter backend start`.
- **Database**: managed PostgreSQL (RDS, Supabase, Neon, etc.) + managed
  Redis. Run `pnpm --filter database prisma migrate deploy` as part of your
  deploy step.

## Recent bug fixes worth knowing about

A few of these were architectural, not cosmetic — worth understanding if
you're extending this codebase:

- **409 on every save**: the autosave path was comparing two unrelated
  numbers -- the document's local per-*edit* counter (used for undo/redo)
  against the server's per-*save* `Board.version`. They diverge after the
  very first edit. Fixed by tracking the server version separately
  (`frontend/hooks/use-autosave.ts`), with an in-flight-save guard to
  prevent overlapping PATCHes, and automatic one-shot conflict recovery
  using the current version the backend now returns in the 409 body.
- **Backend needing a manual restart after an error**: the WebSocket
  message handler had no error boundary. An async event-listener callback
  isn't covered by Fastify's request-level error handling, so any thrown
  error inside it (e.g. a DB hiccup) became an unhandled promise
  rejection -- which crashes the whole Node process by default, taking
  every other in-flight request down with it. Fixed in
  `backend/src/modules/collaboration/collaboration.gateway.ts`, plus
  process-level safety nets in `backend/src/process-safety.ts`.
- **Eraser (and selection) not working on lines/arrows/freehand far from
  their start point**: `getElementBounds()` computed bounds from
  `width`/`height`, which the drawing interaction never actually sets for
  path-based elements (only `points` gets updated while dragging) -- so
  every line/arrow/freehand had a zero-size bounding box at its start,
  and hit-testing silently failed anywhere else along the path. Fixed by
  deriving bounds from the actual `points` array for these types (see
  `packages/editor-core/src/geometry/bounds.ts`, with regression tests).
- **Canvas background not rendering**: the color was correctly stored on
  the document, but the renderer never painted it -- it only did a
  transparent `clearRect`. Fixed in
  `frontend/editor/rendering/canvas-renderer.ts`.
- **Blurry rendering on HiDPI displays**: the render loop set a
  DPR-scaling transform, then immediately overwrote it with a
  DPR-unaware camera transform (`ctx.setTransform()` replaces the whole
  matrix rather than composing) -- every element was drawn at the wrong
  scale on any retina-class screen, not just "briefly during zoom."
  Fixed by folding DPR into the same transform as pan/zoom.

## Known simplifications

Being upfront about where this trades completeness for focus:

- SVG export covers rectangles, diamonds, and ellipses natively; lines/arrows/
  freehand/text fall back to the PNG raster path in the export dialog's
  canvas-based renderer.
- Image upload wires a presigned-URL endpoint but the actual signing call
  (`backend/src/infrastructure/storage/presign.ts`) is a stub — swap in your
  storage provider's SDK (S3, R2, etc.) for production use.
- No CRDT-based offline editing for *authenticated* boards — the app detects
  online/offline/reconnecting and debounces autosave, per the spec, rather
  than implementing full offline-first conflict resolution. Guests get true
  offline persistence (IndexedDB) since there's no server document to
  reconcile with until they sign in.
- "Sloppiness" (architect/artist/normal) is stored per-element and exposed in
  the properties panel, but the renderer doesn't yet vary stroke jitter by
  level — all three currently render identically. Wire actual roughness
  rendering into `frontend/editor/rendering/` if you want the visual
  hand-drawn effect Excalidraw has.
- Canvas text (drawn via `CanvasRenderingContext2D.font`) uses a generic
  `Inter, system-ui, sans-serif` stack rather than the self-hosted Plus
  Jakarta Sans used for UI chrome — `next/font`'s hashed font-family name
  isn't reliably referenceable from canvas fill-text calls.
- The pan/jitter and straight-arrow fixes were validated by code review and
  typecheck/build passes, not by manual click-through in a browser (this
  sandbox has no display) — worth a quick manual pass on your machine.
- Mobile responsiveness (bottom toolbar, bottom-sheet properties panel,
  pinch-to-zoom, mobile header overflow menu) was implemented and
  typechecks/builds cleanly, but — same caveat — hasn't been hand-tested on
  an actual touch device. Worth checking at 375/390/414/768px before you
  treat it as final, especially the nested Background color-picker inside
  the mobile header's overflow dropdown (a Popover nested inside a
  DropdownMenu is a combination worth a manual click-through).
- Frames, comments, libraries, and presentation mode are intentionally out
  of scope, per the "most useful 20%" brief.
