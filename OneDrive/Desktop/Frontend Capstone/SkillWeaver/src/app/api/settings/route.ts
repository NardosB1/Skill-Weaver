import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { loadSampleWorkspace, resetWorkspace, updateUserName } from "@/lib/db";
import { isSameOrigin, validationMessage } from "@/lib/http";
import { profileSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PUT(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request origin could not be verified." }, { status: 403 });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to update settings." }, { status: 401 });
  try {
    const parsed = profileSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check your name." }, { status: 400 });
    const updated = await updateUserName(user.id, parsed.data.name);
    return NextResponse.json({ user: updated });
  } catch (error) { return NextResponse.json({ error: validationMessage(error) }, { status: 400 }); }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request origin could not be verified." }, { status: 403 });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to change workspace data." }, { status: 401 });
  try {
    const body = await request.json() as { action?: string };
    if (body.action !== "sample") return NextResponse.json({ error: "Unknown settings action." }, { status: 400 });
    const workspace = await loadSampleWorkspace(user.id);
    return NextResponse.json({ workspace });
  } catch (error) { return NextResponse.json({ error: validationMessage(error) }, { status: 400 }); }
}

export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request origin could not be verified." }, { status: 403 });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to reset workspace data." }, { status: 401 });
  try { await resetWorkspace(user.id); return NextResponse.json({ ok: true }); }
  catch (error) { return NextResponse.json({ error: validationMessage(error) }, { status: 400 }); }
}
