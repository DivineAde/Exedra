import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "../../infrastructure/database/prisma";
import { env } from "../../config/env";
import { ConflictError, UnauthorizedError } from "./authentication.errors";
import type { RegisterInput, LoginInput } from "@whiteboard/validation";

const SALT_ROUNDS = 10;

export interface TokenPayload {
  userId: string;
}

export function signToken(userId: string): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign({ userId } satisfies TokenPayload, env.JWT_SECRET, options);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ConflictError("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email: input.email, name: input.name, passwordHash },
  });

  return { user, token: signToken(user.id) };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new UnauthorizedError("Invalid email or password");

  if (!user.passwordHash) {
    throw new UnauthorizedError("This account uses Google sign-in. Continue with Google instead.");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new UnauthorizedError("Invalid email or password");

  return { user, token: signToken(user.id) };
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}
