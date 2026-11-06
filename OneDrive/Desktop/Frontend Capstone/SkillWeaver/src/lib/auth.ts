import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { findUserById } from "@/lib/db";
import type { User } from "@/lib/types";

const COOKIE_NAME = "skillweaver_session";
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 7;

function sessionKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to a random value of at least 32 characters. See .env.example.");
  }
  return new TextEncoder().encode(secret);
}

export function assertSessionConfiguration(): void {
  sessionKey();
}

export async function createSession(userId: string): Promise<void> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(sessionKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_AGE_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, sessionKey(), { algorithms: ["HS256"] });
    if (typeof payload.userId !== "string") return null;
    return await findUserById(payload.userId);
  } catch {
    return null;
  }
}
