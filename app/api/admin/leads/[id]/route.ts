import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import db from "@/lib/db";

export const runtime = "nodejs";

const STATUSES = new Set(["new", "reviewed", "contacted", "converted"]);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const b = (await req.json().catch(() => ({}))) as { status?: unknown };
  const status = typeof b.status === "string" ? b.status : "";
  if (!STATUSES.has(status)) return NextResponse.json({ error: "bad status" }, { status: 400 });
  try {
    await db.instantDemoLead.update({ where: { id }, data: { status } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
