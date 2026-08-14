import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../modules/authentication/authentication.errors";

export function errorHandler(error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof ZodError) {
    return reply.status(422).send({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
        details: error.flatten(),
      },
    });
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: { code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}) },
    });
  }

  // Prisma errors are common (e.g. a board deleted between two requests,
  // a duplicate email) and shouldn't fall through to an opaque 500 --
  // that makes a routine "not found" look like a server malfunction from
  // the client's perspective.
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "The requested resource no longer exists" },
      });
    }
    if (error.code === "P2002") {
      return reply.status(409).send({
        success: false,
        error: { code: "ALREADY_EXISTS", message: "A record with that value already exists" },
      });
    }
  }

  request.log.error(error);
  return reply.status(500).send({
    success: false,
    error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
  });
}
