import { NextRequest, NextResponse } from "next/server";
import { geolocation } from "@vercel/functions";
import db from "@/lib/db";
import { buildDemoConfig } from "@/lib/demo/generate";
import { CUISINES } from "@/lib/demo/cuisines";

// Generate an instant preview: builds the full DemoConfig from the inputs,
// saves it to InstantDemoLead (config stored as JSON so the exact preview
// reloads later), logs widget_submitted, and returns the config to render.
// No contact required here. Honeypot + 3/IP/24h rate limit kept.
export const runtime = "nodejs";

const hits = new Map<string, number[]>();
const LIMIT = 3;
const WINDOW = 24 * 60 * 60 * 1000;
function limited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
  if (arr.length >= LIMIT) { hits.set(ip, arr); return true; }
  arr.push(now);
  hits.set(ip, arr);
  return false;
}

export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  if (typeof b.company === "string" && b.company.trim()) {
    return NextResponse.json({ ok: true, id: null, config: null });
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

  const cuisineKey = typeof b.cuisineKey === "string" && CUISINES[b.cuisineKey] ? b.cuisineKey : "other";
  const city = typeof b.city === "string" && b.city.trim() ? b.city.trim().slice(0, 80) : null;
  const sessionId = typeof b.sessionId === "string" && b.sessionId ? b.sessionId : null;
  const photoUrls = Array.isArray(b.photoUrls)
    ? b.photoUrls.filter((u): u is string => typeof u === "string" && /^https?:\/\//.test(u)).slice(0, 5)
    : [];

  try {
    const config = buildDemoConfig({ businessName, cuisineKey, city, photoUrls });
    const geo = geolocation(req);
    const lead = await db.instantDemoLead.create({
      data: {
        businessName,
        businessType: CUISINES[cuisineKey].label,
        photoUrls,
        city: city ?? geo.city ?? null,
        country: geo.country || null,
        sessionId,
        config,
      },
    });
    if (sessionId) {
      const isReturning = (await db.pageEvent.count({ where: { sessionId } })) > 0;
      await db.pageEvent
        .create({ data: { sessionId, eventType: "widget_submitted", path: "/", country: geo.country || null, city: config.city, isReturning } })
        .catch(() => {});
    }
    return NextResponse.json({ ok: true, id: lead.id, config });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
