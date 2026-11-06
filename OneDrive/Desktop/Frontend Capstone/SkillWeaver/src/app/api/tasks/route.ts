import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { addTask, removeTask, toggleTask, updateTask } from "@/lib/db";
import { isSameOrigin, validationMessage } from "@/lib/http";
import { taskSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request origin could not be verified." }, { status: 403 });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to create a task." }, { status: 401 });
  try {
    const parsed = taskSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the task details." }, { status: 400 });
    const task = await addTask(user.id, { ...parsed.data, goalId: parsed.data.goalId || null, dueDate: parsed.data.dueDate || null });
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: validationMessage(error) }, { status: 400 }); }
}

export async function PUT(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request origin could not be verified." }, { status: 403 });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to update a task." }, { status: 401 });
  try {
    const body = await request.json() as { completed?: boolean };
    const parsed = taskSchema.safeParse(body);
    if (!parsed.success || !parsed.data.id) return NextResponse.json({ error: parsed.success ? "Task id is required." : parsed.error.issues[0]?.message }, { status: 400 });
    const { id, ...data } = parsed.data;
    const task = await updateTask(user.id, id, { ...data, goalId: data.goalId || null, dueDate: data.dueDate || null, completed: body.completed });
    return NextResponse.json({ task });
  } catch (error) { return NextResponse.json({ error: validationMessage(error) }, { status: 404 }); }
}

export async function PATCH(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request origin could not be verified." }, { status: 403 });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to update a task." }, { status: 401 });
  try {
    const body = await request.json() as { id?: string; action?: string };
    if (!body.id || body.action !== "toggle") return NextResponse.json({ error: "A task id and toggle action are required." }, { status: 400 });
    const task = await toggleTask(user.id, body.id);
    return NextResponse.json({ task });
  } catch (error) { return NextResponse.json({ error: validationMessage(error) }, { status: 404 }); }
}

export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request origin could not be verified." }, { status: 403 });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to delete a task." }, { status: 401 });
  try {
    const body = await request.json() as { id?: string };
    if (!body.id) return NextResponse.json({ error: "Task id is required." }, { status: 400 });
    await removeTask(user.id, body.id);
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: validationMessage(error) }, { status: 400 }); }
}
