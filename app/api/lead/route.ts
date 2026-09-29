import { NextRequest, NextResponse } from "next/server";
import { geolocation, waitUntil } from "@vercel/functions";
import db from "@/lib/db";
import { sendOwnerMail } from "@/lib/mail";

// The landing's main conversion: "Get your free mockup". Three fields (name,
// restaurant, WhatsApp/phone) + optional email. Saves an InstantDemoLead with
// source "mockup_form", logs widget_submitted for the funnel, and emails the
// owner so the 24h follow-up promise can be kept. Honeypot + 5/IP/24h limit.
export const runtime = "nodejs";

const hits = new Map<string, number[]>();
const LIMIT = 5;
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

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  // Honeypot: bots fill every field. Pretend success, store nothing.
  if (clean(b.company, 100)) return NextResponse.json({ ok: true });

  const ownerName = clean(b.name, 60);
  const businessName = clean(b.restaurant, 80);
  const phone = clean(b.phone, 30);
  const email = clean(b.email, 120);
  const sessionId = clean(b.sessionId, 80) || null;
  const entryPoint = clean(b.entryPoint, 20) || null;

  if (!ownerName || !businessName) {
    return NextResponse.json({ ok: false, error: "Add your name and your restaurant's name." }, { status: 400 });
  }
  if (phone.replace(/\D/g, "").length < 7) {
    return NextResponse.json({ ok: false, error: "Add a phone or WhatsApp number I can message." }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "That email doesn't look right (it's optional, you can leave it empty)." }, { status: 400 });
  }

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (limited(ip)) {
    return NextResponse.json({ ok: false, error: "Got it already. I'll message you soon." }, { status: 429 });
  }

  try {
    const geo = geolocation(req);
    const city = geo.city ? decodeURIComponent(geo.city) : null;
    const lead = await db.instantDemoLead.create({
      data: {
        businessName,
        ownerName,
        contact: phone,
        email: email || null,
        source: "mockup_form",
        photoUrls: [],
        city,
        country: geo.country || null,
        sessionId,
      },
    });

    // Funnel event + owner alert run after the response (waitUntil keeps the
    // function alive for them) - the visitor never waits on SMTP.
    // The owner's own test submissions still save the lead, but stay out of
    // the funnel numbers (same rule as /api/track).
    const isOwner = req.cookies.get("starvega_owner")?.value === "true" || !!req.cookies.get("sv_admin")?.value;
    waitUntil(Promise.allSettled([
      sessionId && !isOwner
        ? db.pageEvent.create({
            data: { sessionId, eventType: "widget_submitted", entryPoint, path: "/", country: geo.country || null, city, isReturning: true },
          })
        : Promise.resolve(),
      sendOwnerMail(
        `New mockup request: ${businessName}`,
        [
          `${ownerName} wants a free mockup.`,
          ``,
          `Restaurant: ${businessName}`,
          `Phone / WhatsApp: ${phone}`,
          `Email: ${email || "-"}`,
          `Location: ${[city, geo.country].filter(Boolean).join(", ") || "unknown"}`,
          ``,
          `Promised a reply within 24h. Leads inbox: https://www.starvega.site/admin`,
        ].join("\n"),
      ),
    ]));

    return NextResponse.json({ ok: true, id: lead.id });
  } catch {
    return NextResponse.json({ ok: false, error: "Something went wrong on my side. Try again, or message me on Instagram." }, { status: 500 });
  }
}
