import { NextRequest, NextResponse } from "next/server";
import { geolocation } from "@vercel/functions";
import db from "@/lib/db";

// Fire-and-forget event sink. Reads geo from the request (Vercel injects it),
// flags returning sessions, writes one PageEvent. Always 200 and swallows errors
// so a tracking hiccup never affects the visitor.

export const runtime = "nodejs";

const EVENTS = new Set([
  "pageview", "section_view", "widget_opened",
  "widget_submitted", "preview_generated", "onboarding_clicked",
  "text_cta_clicked",
]);

export async function POST(req: NextRequest) {
  try {
    const b = (await req.json()) as Record<string, unknown>;
    const sessionId = typeof b.sessionId === "string" ? b.sessionId : "";
    const eventType = typeof b.eventType === "string" ? b.eventType : "";
    if (!sessionId || !EVENTS.has(eventType)) return NextResponse.json({ ok: false }, { status: 200 });

    const geo = geolocation(req);
    const isReturning = (await db.pageEvent.count({ where: { sessionId } })) > 0;

    await db.pageEvent.create({
      data: {
        sessionId,
        eventType,
        sectionId: typeof b.sectionId === "string" ? b.sectionId : null,
        path: typeof b.path === "string" ? b.path : "/",
        referrer: typeof b.referrer === "string" && b.referrer ? b.referrer : null,
        country: geo.country || null,
        city: geo.city ? decodeURIComponent(geo.city) : null,
        isReturning,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
