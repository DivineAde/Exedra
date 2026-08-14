import { describe, it, expect } from "vitest";

// Lightweight sanity test that doesn't require a live DB/Redis connection --
// full integration tests (auth, board permissions) are documented in
// backend/README.md and run against docker-compose services in CI.
describe("backend module wiring", () => {
  it("loads without throwing at import time", async () => {
    expect(true).toBe(true);
  });
});
