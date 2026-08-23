import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import db from "@/lib/db";

// 3-hourly digest (triggered by a GitHub Actions schedule — see
// .github/workflows/digest.yml; Vercel Hobby only allows daily crons).
// Summarizes the last 3 hours from the analytics DB and emails it. Sends only
// when there was activity, so quiet windows don't spam the inbox. Replaces the
// old per-visit email. Auth: caller sends Authorization: Bearer $CRON_SECRET.

export const runtime = "nodejs";
export const maxDuration = 60;

const SECTION_ORDER = ["hook", "agitate", "turn", "proof", "offer", "objections", "cta"];

function fmtDur(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return m ? `${m}m ${s}s` : `${s}s`;
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET not set" }, { status: 503 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const W = `"createdAt" > now() - interval '3 hours'`;

    const [ov] = (await db.$queryRawUnsafe(
      `SELECT
        (SELECT COUNT(DISTINCT "sessionId")::int FROM "PageEvent" WHERE ${W}) AS visitors,
        (SELECT COUNT(DISTINCT "sessionId")::int FROM "PageEvent" WHERE "isReturning" AND ${W}) AS returning,
        (SELECT COUNT(*)::int FROM "PageEvent" WHERE "eventType"='pageview' AND ${W}) AS pageviews,
        (SELECT COUNT(DISTINCT "sessionId")::int FROM "PageEvent" WHERE "eventType"='section_view' AND "sectionId"='cta' AND ${W}) AS reached_cta`,
    )) as { visitors: number; returning: number; pageviews: number; reached_cta: number }[];

    const [dur] = (await db.$queryRawUnsafe(
      `SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (mx-mn))),0)::float AS secs
       FROM (SELECT "sessionId", MIN("createdAt") mn, MAX("createdAt") mx FROM "PageEvent" WHERE ${W} GROUP BY 1) s`,
    )) as { secs: number }[];

    const sections = (await db.$queryRawUnsafe(
      `SELECT "sectionId" id, COUNT(DISTINCT "sessionId")::int c FROM "PageEvent"
       WHERE "eventType"='section_view' AND "sectionId" IS NOT NULL AND ${W} GROUP BY 1`,
    )) as { id: string; c: number }[];
    const secMap = new Map(sections.map((s) => [s.id, s.c]));

    const widget = (await db.$queryRawUnsafe(
      `SELECT "eventType" t, COUNT(DISTINCT "sessionId")::int c FROM "PageEvent"
       WHERE "eventType" IN ('widget_opened','widget_submitted','preview_generated','onboarding_clicked') AND ${W} GROUP BY 1`,
    )) as { t: string; c: number }[];
    const wMap = new Map(widget.map((w) => [w.t, w.c]));

    const refs = (await db.$queryRawUnsafe(
      `SELECT COALESCE(NULLIF("referrer",''),'Direct') r, COUNT(DISTINCT "sessionId")::int c FROM "PageEvent"
       WHERE ${W} GROUP BY 1 ORDER BY c DESC LIMIT 5`,
    )) as { r: string; c: number }[];

    const locs = (await db.$queryRawUnsafe(
      `SELECT COALESCE(NULLIF("city",''),'Unknown') city, COALESCE("country",'') country, COUNT(DISTINCT "sessionId")::int c FROM "PageEvent"
       WHERE ${W} GROUP BY 1,2 ORDER BY c DESC LIMIT 5`,
    )) as { city: string; country: string; c: number }[];

    const leads = await db.instantDemoLead.findMany({
      where: { createdAt: { gt: new Date(Date.now() - 3 * 60 * 60 * 1000) } },
      orderBy: { createdAt: "desc" },
    });

    const visitors = ov?.visitors ?? 0;
    if (visitors === 0 && leads.length === 0) {
      return NextResponse.json({ ok: true, skipped: "no activity" });
    }

    const pct = (n: number) => (visitors ? Math.round((n / visitors) * 100) : 0);
    const lines = [
      `Starvega — last 3 hours`,
      ``,
      `Visitors: ${visitors}   (${visitors - (ov.returning || 0)} new, ${ov.returning || 0} returning)`,
      `Pageviews: ${ov.pageviews}   Avg session: ${fmtDur(dur?.secs ?? 0)}`,
      `Reached the offer/CTA: ${ov.reached_cta} of ${visitors} (${pct(ov.reached_cta)}%)`,
      ``,
      `Funnel (visitors who reached each section):`,
      ...SECTION_ORDER.map((s) => `  ${s.padEnd(11)} ${secMap.get(s) ?? 0}`),
      ``,
      `Instant-preview widget:`,
      `  opened     ${wMap.get("widget_opened") ?? 0}`,
      `  submitted  ${wMap.get("widget_submitted") ?? 0}`,
      `  preview    ${wMap.get("preview_generated") ?? 0}`,
      `  onboarding ${wMap.get("onboarding_clicked") ?? 0}`,
      ``,
      `New leads: ${leads.length}`,
      ...leads.map((l) => `  - ${l.businessName}${l.businessType ? ` (${l.businessType})` : ""}${l.city ? `, ${l.city}` : ""}`),
      ``,
      `Top referrers:`,
      ...(refs.length ? refs.map((r) => `  ${r.r} — ${r.c}`) : ["  (none)"]),
      ``,
      `Top locations:`,
      ...(locs.length ? locs.map((l) => `  ${[l.city, l.country].filter(Boolean).join(", ")} — ${l.c}`) : ["  (none)"]),
    ];

    await sendMail(`Starvega digest: ${visitors} visitors, ${leads.length} leads (3h)`, lines.join("\n"));
    return NextResponse.json({ ok: true, visitors, leads: leads.length });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

async function sendMail(subject: string, text: string) {
  const host = process.env.SMTP_HOST;
  const to = process.env.TRACK_NOTIFY_TO;
  if (!host || !to) return;
  const port = Number(process.env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transport.sendMail({ from: process.env.TRACK_NOTIFY_FROM || process.env.SMTP_USER, to, subject, text });
}
