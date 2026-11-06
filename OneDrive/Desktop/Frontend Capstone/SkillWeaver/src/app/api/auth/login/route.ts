import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail, publicUser } from "@/lib/db";
import { assertSessionConfiguration, createSession } from "@/lib/auth";
import { isSameOrigin } from "@/lib/http";
import { loginSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request origin could not be verified." }, { status: 403 });
  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check your details." }, { status: 400 });
    assertSessionConfiguration();
    const user = await findUserByEmail(parsed.data.email);
    const valid = user ? await bcrypt.compare(parsed.data.password, user.passwordHash) : false;
    if (!user || !valid) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    await createSession(user.id);
    return NextResponse.json({ user: publicUser(user) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to sign in." }, { status: 400 });
  }
}
