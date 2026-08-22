import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Visitor notification: emails the owner each time a NEW browser session lands.
// Triggered by a client beacon (components/VisitTracker), so bots that don't run
// JS almost never fire it, and sessionStorage dedupe keeps refreshes quiet.
//
// IP comes from x-forwarded-for; location comes from Vercel's built-in geo
// headers (no third-party service). The owner excludes their own browsers with
// the opt-out cookie (see ./optout) — their IP changes, so a cookie is the
// reliable exclusion. TRACK_EXCLUDE_IPS is an optional belt-and-suspenders list.
//
// Always returns 200: a notification hiccup must never surface to the visitor.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function firstIp(xff: string | null): string {
  return xff ? xff.split(",")[0].trim() : "";
}

export async function POST(req: NextRequest) {
  try {
    // 1) Owner opted this browser out — silently skip.
    if (req.cookies.get("st_notrack")?.value === "1") {
      return NextResponse.json({ ok: true, skipped: "optout" });
    }

    const h = req.headers;
    const ua = h.get("user-agent") || "";

    // 2) Skip obvious bots/crawlers (the JS beacon already filters most).
    if (/bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|monitor|preview|lighthouse/i.test(ua)) {
      return NextResponse.json({ ok: true, skipped: "bot" });
    }

    const ip = firstIp(h.get("x-forwarded-for")) || h.get("x-real-ip") || "";

    // 3) Owner's known IPs (optional env list).
    const excluded = (process.env.TRACK_EXCLUDE_IPS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (ip && excluded.includes(ip)) {
      return NextResponse.json({ ok: true, skipped: "excluded-ip" });
    }

    // 4) Location from Vercel edge geo headers (present in production).
    const dec = (v: string | null) => (v ? decodeURIComponent(v) : "");
    const geo = {
      city: dec(h.get("x-vercel-ip-city")),
      region: dec(h.get("x-vercel-ip-country-region")),
      country: dec(h.get("x-vercel-ip-country")),
      lat: h.get("x-vercel-ip-latitude") || "",
      lon: h.get("x-vercel-ip-longitude") || "",
      tz: dec(h.get("x-vercel-ip-timezone")),
    };
    let where = [geo.city, geo.region, geo.country].filter(Boolean).join(", ");

    // Fallback lookup if Vercel geo headers are absent (e.g. self-hosted) but we
    // have a public IP.
    if (!where && ip && !/^(::1|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip)) {
      try {
        const r = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country`, {
          cache: "no-store",
        });
        if (r.ok) {
          const d = (await r.json()) as { city?: string; regionName?: string; country?: string };
          where = [d.city, d.regionName, d.country].filter(Boolean).join(", ");
        }
      } catch {
        /* best-effort */
      }
    }

    const body = (await req.json().catch(() => ({}))) as { referrer?: unknown; path?: unknown };
    const referrer = typeof body.referrer === "string" && body.referrer ? body.referrer : "direct / none";
    const path = typeof body.path === "string" ? body.path : "/";

    await sendEmail({ ip, where, geo, ua, referrer, path });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

async function sendEmail(v: {
  ip: string;
  where: string;
  geo: { city: string; region: string; country: string; lat: string; lon: string; tz: string };
  ua: string;
  referrer: string;
  path: string;
}) {
  const host = process.env.SMTP_HOST;
  const to = process.env.TRACK_NOTIFY_TO;
  // Not configured yet → no-op (nothing to send through).
  if (!host || !to) return;

  const port = Number(process.env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const mapLink =
    v.geo.lat && v.geo.lon ? `https://www.google.com/maps?q=${v.geo.lat},${v.geo.lon}` : "";

  const lines = [
    `New visit on Starvega.`,
    ``,
    `Location:  ${v.where || "unknown"}`,
    `IP:        ${v.ip || "unknown"}`,
    v.geo.tz ? `Timezone:  ${v.geo.tz}` : "",
    mapLink ? `Map:       ${mapLink}` : "",
    ``,
    `Page:      ${v.path}`,
    `Came from: ${v.referrer}`,
    `Device:    ${v.ua}`,
    `Time:      ${new Date().toISOString()}`,
  ].filter(Boolean);

  await transport.sendMail({
    from: process.env.TRACK_NOTIFY_FROM || process.env.SMTP_USER,
    to,
    subject: `Starvega visit — ${v.where || v.ip || "unknown"}`,
    text: lines.join("\n"),
  });
}
