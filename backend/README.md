# backend

Fastify API + WebSocket collaboration server.

## Structure

```text
src/
├── server.ts                    App bootstrap: plugins, routes, listen
├── config/env.ts                 Zod-validated environment config
├── modules/
│   ├── authentication/           Register/login/logout/me, JWT issuing
│   ├── users/                    User → DTO mapping
│   ├── boards/                   Board CRUD, permissions, optimistic saves
│   ├── board-members/             Sharing / role management
│   ├── collaboration/             WebSocket gateway + in-memory room manager
│   ├── file-storage/               Presigned upload endpoint
│   └── health/                    /api/health
├── middleware/
│   ├── require-auth.ts            Cookie/Bearer JWT verification
│   └── error-handler.ts           Consistent { success, error } responses
├── infrastructure/
│   ├── database/prisma.ts          Re-exports the shared Prisma client
│   ├── redis/client.ts              ioredis client (presence/pub-sub ready)
│   └── storage/presign.ts           S3-compatible presign stub
└── websocket/                     (reserved for future ws helpers)
```

## Run locally

```bash
docker compose up -d postgres redis   # from repo root
pnpm db:generate && pnpm db:migrate && pnpm db:seed
pnpm --filter backend dev
```

## Testing

```bash
pnpm --filter backend test
```

Unit tests that don't require a live DB run standalone. Full auth/board/
permission integration tests are intended to run against the docker-compose
Postgres instance in CI (see `.github/workflows/ci.yml`).

## Security notes

- Passwords hashed with bcrypt (10 rounds).
- JWT stored in an httpOnly, sameSite cookie; also returned in the response
  body once at login/register so the frontend can attach it to the WebSocket
  handshake (browsers don't send cookies on `new WebSocket()`).
- Every board-scoped route re-resolves the caller's role from the database
  (`resolveBoardRole` / `requireBoardRole`) — `boardId`/`userId`/`role` are
  never trusted from the request body.
- Rate limiting via `@fastify/rate-limit` (200 req/min per client, tune for
  production)...
