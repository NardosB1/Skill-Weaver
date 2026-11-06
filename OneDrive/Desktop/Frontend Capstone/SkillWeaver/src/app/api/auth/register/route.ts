import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser } from "@/lib/db";
import { assertSessionConfiguration, createSession } from "@/lib/auth";
import { isSameOrigin, validationMessage } from "@/lib/http";
import { registerSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request origin could not be verified." }, { status: 403 });
  try {
    const parsed = registerSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the form details." }, { status: 400 });
    assertSessionConfiguration();
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await createUser({ name: parsed.data.name, email: parsed.data.email, passwordHash });
    await createSession(user.id);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    const message = validationMessage(error);
    return NextResponse.json({ error: message }, { status: message.includes("already exists") ? 409 : 400 });
  }
}
