# Deployment Guide

Two paths through this doc:

- **[Local development](#local-development)** — run everything on your machine.
- **[Production deployment](#production-deployment)** — ship it live.

---

## Local development

### Prerequisites

- Node.js 18.18+ (`node --version`)
- pnpm 9 (`npm install -g pnpm`)
- A PostgreSQL 14+ database and a Redis instance, reachable from your machine.
  Either:
  - **Docker** (simplest): `docker compose up -d` from the repo root spins up
    both, matching the defaults below, or
  - Native installs of Postgres/Redis, or hosted free tiers (Neon, Upstash) —
    anything reachable by a connection string works. Docker is not required.

### 1. Install dependencies

From the repo root (not any subfolder):

```bash
pnpm install
```

This installs every workspace package (`frontend`, `backend`, `database`,
`packages/*`) in one pass via pnpm workspaces.

### 2. Start Postgres + Redis

```bash
docker compose up -d
```

Skip this if you're pointing at your own Postgres/Redis instead.

### 3. Configure environment variables

Each app reads its **own** `.env` file — there is no single shared one.
Create all three from the root `.env.example`:

```bash
cp .env.example database/.env
cp .env.example backend/.env
cp .env.example frontend/.env.local
```

Then trim each down to what that app actually needs (extra vars are
harmless, but here's the minimum):

**`database/.env`**
```
DATABASE_URL="postgresql://whiteboard:whiteboard@localhost:5432/whiteboard?schema=public"
```

**`backend/.env`**
```
DATABASE_URL="postgresql://whiteboard:whiteboard@localhost:5432/whiteboard?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="any-random-string-at-least-10-characters"
JWT_EXPIRES_IN="7d"
PORT=4000
CORS_ORIGIN="http://localhost:3000"
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:4000"
# Optional -- omit both to disable Google Sign-In:
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

**`frontend/.env.local`**
```
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_WS_URL="ws://localhost:4000"
```

If the Docker Compose defaults (user/password/db name `whiteboard`) don't
match your own Postgres instance, adjust `DATABASE_URL` accordingly.

### 4. Set up the database

```bash
pnpm db:generate     # generates the Prisma client
pnpm db:migrate       # creates and applies migrations (interactive)
pnpm db:seed          # loads a demo user + demo board
```

Seed login: `demo@whiteboard.app` / `password123`.

### 5. Run it

```bash
pnpm dev
```

- Frontend → http://localhost:3000
- Backend → http://localhost:4000
- Guest editor (no login needed) → http://localhost:3000/editor

### Common local issues

| Symptom | Fix |
|---|---|
| `Invalid environment variables: DATABASE_URL Required` | You're missing `backend/.env` — env vars are per-app, not shared from the root |
| `unable to determine transport target for "pino-pretty"` | Run `pnpm install` again — `pino-pretty` is a devDependency and needs to be present |
| `Environment variable not found: DATABASE_URL` from Prisma | Prisma reads `database/.env` specifically — create it even if `backend/.env` already has the same value |
| `EBUSY`/`ECONNRESET` during `pnpm install` on Windows | Usually antivirus or OneDrive/Dropbox locking files mid-write — move the project out of a synced folder, or run `pnpm config set network-concurrency 1` and retry |
| `pnpm install` ran but `frontend/node_modules/next` doesn't exist | The install didn't finish — check the tail of the output for an `ERR_PNPM` line and re-run `pnpm install` after `rm -rf node_modules` |

---

## Production deployment

### Architecture recap

The backend needs a **long-lived process that supports WebSocket
connections** — this rules out classic serverless functions (Vercel
serverless, AWS Lambda) for it specifically. Split hosting:

| Component | Recommended | Why |
|---|---|---|
| Frontend (Next.js) | Vercel | Built for Next.js, zero-config |
| Backend (Fastify + WS) | Railway or Render | Persistent process, WebSocket-friendly |
| PostgreSQL | Neon, Supabase, or Railway/Render managed | Managed backups |
| Redis | Upstash, or Railway/Render managed | Cheap, works with ephemeral connections |

This guide uses **Railway** (backend + DB + Redis) and **Vercel** (frontend)
as the concrete example — swap in Render/Fly.io/your own VPS following the
same steps if you prefer.

### 1. Push to GitHub

Both Railway and Vercel deploy from a GitHub repo. Commit this project and
push it if you haven't already.

### 2. Provision the database

Create a Postgres instance (Neon, Supabase, or Railway's Postgres plugin).
Copy its connection string.

Run migrations against it from your local machine once, before the backend
ever boots against it:

```bash
# in database/.env, point DATABASE_URL at the production database
pnpm db:generate
pnpm --filter database prisma migrate deploy   # non-interactive, safe for prod
```

Use `migrate deploy`, not `migrate dev` — `deploy` only applies existing
migrations and never prompts or generates new ones. Do **not** run
`pnpm db:seed` against production unless you specifically want the demo
user/board created there.

### 3. Provision Redis

Create a Redis instance (Upstash's free tier is fine to start). Copy its
connection string (`rediss://...` for Upstash's TLS endpoint).

### 4. Deploy the backend (Railway)

1. New Project → Deploy from GitHub repo → select this repo.
2. Set the service's **root directory to `backend`**.
3. Build command: `cd .. && pnpm install --frozen-lockfile && pnpm --filter backend build`
   (runs from the monorepo root so workspace packages resolve correctly).
4. Start command: `pnpm --filter backend start`
5. Environment variables:
   ```
   NODE_ENV=production
   DATABASE_URL=<your Postgres connection string>
   REDIS_URL=<your Redis connection string>
   JWT_SECRET=<generate with: openssl rand -base64 32>
   JWT_EXPIRES_IN=7d
   PORT=4000
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   BACKEND_URL=https://your-backend-domain.up.railway.app
   GOOGLE_CLIENT_ID=<optional>
   GOOGLE_CLIENT_SECRET=<optional>
   ```
6. Deploy. Confirm `https://your-backend-domain/api/health` returns
   `{"success":true,"data":{"status":"ok",...}}`.
7. If using Google Sign-In, add
   `https://your-backend-domain/api/auth/google/callback` as an authorized
   redirect URI in Google Cloud Console
   ([console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)).

### 5. Deploy the frontend (Vercel)

1. Import the repo in Vercel.
2. Set the project's **root directory to `frontend`**.
3. Framework preset: Next.js (auto-detected). Build command and output stay
   default.
4. Environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-domain.up.railway.app
   NEXT_PUBLIC_WS_URL=wss://your-backend-domain.up.railway.app
   ```
   Use `wss://`, not `ws://`, once the backend is served over HTTPS.
5. Deploy. Add a custom domain under Project Settings → Domains once you're
   ready to move off `*.vercel.app`.

### 6. Double-check cross-origin/cookie config

Frontend and backend live on different domains in this setup, so:

- `CORS_ORIGIN` on the backend must **exactly** match the deployed frontend
  URL — same scheme, no trailing slash.
- The session cookie is already set with `secure: true` whenever
  `NODE_ENV=production` (see `backend/src/modules/authentication`) — just
  confirm Railway actually has `NODE_ENV=production` set.
- Cookie is `sameSite: "lax"`, which is fine for this two-domain setup. If
  you ever see login working but the session not persisting, that's the
  first thing to check — switch to `sameSite: "none"` (still requires
  `secure: true`) if needed.

### 7. Smoke test

Before calling it done, manually verify:


- [ ] Register a new user → session persists across a page reload
- [ ] Create a board, draw something, refresh → it's still there
- [ ] Open the same board in two browsers/tabs as different users →
      elements sync live, cursors are visible
- [ ] Visit `/editor` as a guest, draw, then sign up → the board migrates
      into the new account
- [ ] `/api/health` returns 200; no CORS or cookie errors in the browser
      console/network tab
- [ ] Export PNG/SVG/JSON all download correctly

### 8. Keep it running

- Both Railway and Vercel auto-deploy on every push to `main` once connected
  — no extra CI wiring needed for basic redeploys.
- The repo's `.github/workflows/ci.yml` runs typecheck/lint/test/build on
  every PR — set `DATABASE_URL` and `JWT_SECRET` as GitHub Actions repo
  secrets so it can run migrations against a throwaway CI database.
- Rotate `JWT_SECRET` and any database credentials if they're ever exposed
  (committed by accident, pasted in a screenshot, etc.) — existing sessions
  will be invalidated, which is the point.
- Monitor `/api/health` with an uptime checker (UptimeRobot, Better Uptime,
  etc.) so you know if the backend goes down before a user tells you.

### Scaling beyond a single backend instance

If you outgrow one backend instance, the realtime layer needs one change:
`backend/src/modules/collaboration/room-manager.ts` currently tracks
presence/rooms in an in-process `Map`, which only works correctly with a
single backend instance (a user connected to instance A won't see
broadcasts from instance B). The `redis` client is already wired up in
`backend/src/infrastructure/redis/client.ts` for exactly this — swap the
`RoomManager`'s in-memory maps for Redis pub/sub (`PUBLISH`/`SUBSCRIBE` per
board room) before running more than one backend instance behind a load
balancer.
