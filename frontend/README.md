# frontend

Next.js (App Router) dashboard + whiteboard editor.

## Structure

```text
app/                Routes: /, /login, /register, /dashboard, /boards/[boardId], /settings
components/          UI grouped by responsibility (layout, navigation, boards,
                     editor, dialogs, theme, feedback, ui primitives)
editor/rendering/    Canvas drawing functions, one per element type
features/            Feature-scoped hooks + forms (auth, boards)
hooks/               Cross-cutting hooks (keyboard shortcuts, autosave,
                     collaboration, canvas pointer interactions)
stores/              Zustand stores, split by responsibility (editor, camera,
                     selection, history lives inside editor-store, ui,
                     collaboration)
services/            API client + WebSocket client
providers/           Theme / TanStack Query / Auth context providers
lib/                 cn() helper, formatting, shared constants
```

## Run locally

```bash
pnpm --filter frontend dev
```

Requires the backend running on `NEXT_PUBLIC_API_URL` (default
`http://localhost:4000`).

## Notable design decisions

- The canvas is a single `<canvas>` element drawn inside a
  `requestAnimationFrame` loop (`components/editor/EditorCanvas.tsx`), which
  reads Zustand state with `.getState()` rather than `useStore()` — so canvas
  redraws never wait on a React render pass, and dragging 100s of elements
  stays smooth.
- All shape math (hit-testing, bounds, resize, undo/redo) lives in
  `@whiteboard/editor-core`, imported here but owned by the package — this
  file tree has no shape-math logic of its own.
- Keyboard shortcuts (`hooks/use-keyboard-shortcuts.ts`) use
  `event.metaKey || event.ctrlKey` so they work identically on macOS and
  Windows/Linux.
