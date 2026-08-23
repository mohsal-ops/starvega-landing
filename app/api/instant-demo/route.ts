import { NextRequest, NextResponse } from "next/server";
import { geolocation } from "@vercel/functions";
import db from "@/lib/db";

// Instant-demo submission: honeypot + 3/IP/24h rate limit, save the lead, log a
// widget_submitted event. Photos are already in Blob (client-uploaded); we store
// their URLs. Never throws to the visitor.
export const runtime = "nodejs";

// Simple in-memory limiter (resets on cold start — fine at this scale, per spec).
const hits = new Map<string, number[]>();
const LIMIT = 3;
const WINDOW = 24 * 60 * 60 * 1000;
function limited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
  if (arr.length >= LIMIT) {
    hits.set(ip, arr);
    return true;
  }
  arr.push(now);
  hits.set(ip, arr);
  return false;
}

export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  // Honeypot: real users never fill this. Pretend success, save nothing.
  if (typeof b.company === "string" && b.company.trim()) {
    return NextResponse.json({ ok: true, id: null, businessName: "", photoUrls: [] });
  }

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (limited(ip)) {
    return NextResponse.json(
      { ok: false, error: "That's a few previews for today. Message me on Instagram and I'll build yours." },
      { status: 429 },
    );
  }

  const businessName = typeof b.businessName === "string" ? b.businessName.trim().slice(0, 60) : "";
  if (!businessName) return NextResponse.json({ ok: false, error: "Business name is required." }, { status: 400 });

  const businessType = typeof b.businessType === "string" && b.businessType ? b.businessType : null;
  const contact = typeof b.contact === "string" && b.contact.trim() ? b.contact.trim().slice(0, 120) : null;
  const sessionId = typeof b.sessionId === "string" && b.sessionId ? b.sessionId : null;
  const photoUrls = Array.isArray(b.photoUrls)
    ? b.photoUrls.filter((u): u is string => typeof u === "string" && /^https?:\/\//.test(u)).slice(0, 5)
    : [];

  try {
    const geo = geolocation(req);
    const lead = await db.instantDemoLead.create({
      data: {
        businessName,
        businessType,
        photoUrls,
        contact,
        country: geo.country || null,
        city: geo.city ? decodeURIComponent(geo.city) : null,
        sessionId,
      },
    });
    if (sessionId) {
      const isReturning = (await db.pageEvent.count({ where: { sessionId } })) > 0;
      await db.pageEvent
        .create({
          data: {
            sessionId,
            eventType: "widget_submitted",
            path: "/",
            country: geo.country || null,
            city: geo.city ? decodeURIComponent(geo.city) : null,
            isReturning,
          },
        })
        .catch(() => {});
    }
    return NextResponse.json({ ok: true, id: lead.id, businessName, businessType, photoUrls });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
