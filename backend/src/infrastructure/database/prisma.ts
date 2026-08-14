// Re-exports the shared Prisma client from the `database` workspace package
// so backend modules import from a single, consistent location.
export { prisma } from "database/prisma/client";
export type { Board, User, BoardMember, BoardRole } from "@prisma/client";
