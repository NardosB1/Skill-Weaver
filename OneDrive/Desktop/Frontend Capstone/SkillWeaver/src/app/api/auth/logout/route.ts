import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { isSameOrigin } from "@/lib/http";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request origin could not be verified." }, { status: 403 });
  await clearSession();
  return NextResponse.json({ ok: true });
}
