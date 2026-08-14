import type { FastifyBaseLogger } from "fastify";

/**
 * Defense-in-depth process-level safety nets. The real fixes for known
 * failure modes live at their source (e.g. the try/catch wrapping the
 * WebSocket message handler in collaboration.gateway.ts) -- this exists
 * to make sure that if some *other*, not-yet-found async callback ever
 * rejects without a local catch, the server logs it clearly and keeps
 * serving requests instead of dying silently and needing a manual restart.
 *
 * We deliberately do NOT catch synchronous uncaughtException and continue
 * running: Node's own docs recommend against resuming after one, since
 * the process may be in a corrupted state (e.g. a broken lock, a half-
 * written buffer). We log it clearly and exit, which lets a process
 * manager (systemd, Railway/Render/Docker's restart policy, pm2, etc.)
 * restart cleanly -- "crash and restart" is the safe behavior for a truly
 * unexpected synchronous error, whereas silently continuing is not.
 */
export function registerProcessSafetyNets(logger: FastifyBaseLogger) {
  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled promise rejection (recovered -- server continues running)");
  });

  process.on("uncaughtException", (error) => {
    logger.fatal({ err: error }, "Uncaught exception -- exiting so the process manager can restart cleanly");
    process.exit(1);
  });
}
