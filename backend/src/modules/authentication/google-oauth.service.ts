import { prisma } from "../../infrastructure/database/prisma";

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

/** Exchanges a Google OAuth access token for the user's profile, then
 * finds-or-creates a local User row. Accounts are matched first by
 * googleId, then by email (so someone who registered with a password
 * can later "Continue with Google" using the same address and the two
 * identities merge onto one account). */
export async function findOrCreateGoogleUser(accessToken: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch Google profile");
  }
  const profile = (await res.json()) as GoogleUserInfo;

  const existingByGoogleId = await prisma.user.findUnique({ where: { googleId: profile.sub } });
  if (existingByGoogleId) return existingByGoogleId;

  const existingByEmail = await prisma.user.findUnique({ where: { email: profile.email } });
  if (existingByEmail) {
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: { googleId: profile.sub, avatarUrl: existingByEmail.avatarUrl ?? profile.picture },
    });
  }

  return prisma.user.create({
    data: {
      email: profile.email,
      name: profile.name,
      googleId: profile.sub,
      avatarUrl: profile.picture,
      passwordHash: null,
    },
  });
}
