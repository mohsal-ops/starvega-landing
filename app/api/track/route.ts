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
  "text_cta_clicked", "preview_opened", "preview_dashboard_opened",
  "pack_selected",
]);

// Which entry point sent the visitor to the widget (only meaningful on
// widget_opened). Validated so a bad value never lands in the column.
const ENTRY_POINTS = new Set(["sticky_nav", "post_hook", "post_proof", "final_cta"]);

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
        entryPoint: typeof b.entryPoint === "string" && ENTRY_POINTS.has(b.entryPoint) ? b.entryPoint : null,
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
