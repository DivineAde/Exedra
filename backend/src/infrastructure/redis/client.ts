import Redis from "ioredis";
import { env } from "../../config/env";

// Used for: pub/sub fan-out of realtime events across backend instances,
// and ephemeral presence state (connected users, live selections/cursors).
// Never used to persist board documents or history.
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: false,
});

redis.on("error", (err) => {
  console.error("[redis] connection error:", err.message);
});
