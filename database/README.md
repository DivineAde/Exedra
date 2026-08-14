# database

Prisma schema, migrations, and seed data for the Whiteboard app.

## Setup

```bash
docker compose up -d postgres
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

## Models

- `User` — account + credentials
- `Board` — a whiteboard, storing its live document as JSONB
- `BoardMember` — per-user role (`OWNER` / `EDITOR` / `VIEWER`) on a board
- `BoardRevision` — periodic checkpoints of a board's document for history/recovery

Cursor and pointer movement are intentionally **not** persisted here — those are
ephemeral and travel over WebSocket/Redis only (see `backend/src/modules/collaboration`).
