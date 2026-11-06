import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { addGoal, removeGoal, updateGoal } from "@/lib/db";
import { isSameOrigin, validationMessage } from "@/lib/http";
import { goalSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request origin could not be verified." }, { status: 403 });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to create a goal." }, { status: 401 });
  try {
    const parsed = goalSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the goal details." }, { status: 400 });
    const goal = await addGoal(user.id, { ...parsed.data, targetDate: parsed.data.targetDate || null });
    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: validationMessage(error) }, { status: 400 }); }
}

export async function PUT(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request origin could not be verified." }, { status: 403 });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to update a goal." }, { status: 401 });
  try {
    const parsed = goalSchema.safeParse(await request.json());
    if (!parsed.success || !parsed.data.id) return NextResponse.json({ error: parsed.success ? "Goal id is required." : parsed.error.issues[0]?.message }, { status: 400 });
    const { id, ...data } = parsed.data;
    const goal = await updateGoal(user.id, id, { ...data, targetDate: data.targetDate || null });
    return NextResponse.json({ goal });
  } catch (error) { return NextResponse.json({ error: validationMessage(error) }, { status: 404 }); }
}

export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request origin could not be verified." }, { status: 403 });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to delete a goal." }, { status: 401 });
  try {
    const body = await request.json() as { id?: string };
    if (!body.id) return NextResponse.json({ error: "Goal id is required." }, { status: 400 });
    await removeGoal(user.id, body.id);
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: validationMessage(error) }, { status: 400 }); }
}
