import { google } from "googleapis";
import { SITE } from "./site";
import { trackedQueries, queryMatchesPhrase } from "./tracked-queries";

// Google Search Console integration for the admin ranking panel. Real ranking /
// impression data lives ONLY in Search Console - GA4 never exposes the search
// terms - so this is the source for the "Search rankings" section.
//
// Auth is a single service account (no user OAuth flow): this is one owner and
// one property. Set GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_KEY,
// and grant that service-account email access to the property in Search Console.

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
// URL-prefix property, exactly as verified in Search Console (trailing slash).
const SITE_URL = SITE.url;

export function gscConfigured(): boolean {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
}

type RawRow = { query: string; date: string; clicks: number; impressions: number; position: number };

// Normalize a service-account private key pasted into an env var. Tolerates the
// two common mistakes: surrounding quotes copied along with the value, and
// literal "\n" escapes that were never turned into real newlines. Without this,
// either one yields an OpenSSL "DECODER routines::unsupported" error.
function normalizePrivateKey(raw: string): string {
  let key = raw.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").trim();
}

async function fetchSearchAnalytics(startDate: string, endDate: string): Promise<RawRow[]> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const key = normalizePrivateKey(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "");

  const auth = new google.auth.JWT({ email, key, scopes: [SCOPE] });
  const webmasters = google.webmasters({ version: "v3", auth });

  const res = await webmasters.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["query", "date"],
      rowLimit: 25000,
      dataState: "all",
    },
  });

  return (res.data.rows || []).map((r) => ({
    query: r.keys?.[0] ?? "",
    date: r.keys?.[1] ?? "",
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    position: r.position ?? 0,
  }));
}

export type RankPhrase = {
  phrase: string;
  slug: string;
  title: string;
  impressions: number;
  clicks: number;
  ctr: number; // 0..1
  position: number; // impression-weighted average; 0 when not appearing
  appearing: boolean; // any impressions in the period
  trend: { date: string; position: number }[]; // per-day avg position, ascending
};

export type RankingsResult =
  | { status: "not_configured" }
  | { status: "error"; message: string }
  | { status: "ok"; phrases: RankPhrase[]; startDate: string; endDate: string };

// Impression-weighted average position, the correct way to combine GSC rows
// (each row's position is already an average for that query/date).
function weightedPosition(rows: { impressions: number; position: number }[]): number {
  const imp = rows.reduce((a, r) => a + r.impressions, 0);
  if (imp === 0) return 0;
  const sum = rows.reduce((a, r) => a + r.position * r.impressions, 0);
  return sum / imp;
}

export async function getRankings(startDate: string, endDate: string): Promise<RankingsResult> {
  if (!gscConfigured()) return { status: "not_configured" };

  let rows: RawRow[];
  try {
    rows = await fetchSearchAnalytics(startDate, endDate);
  } catch (e) {
    const err = e as { message?: string; code?: number };
    return { status: "error", message: err.message || "Search Console request failed." };
  }

  const phrases: RankPhrase[] = trackedQueries().map((t) => {
    const matched = rows.filter((r) => queryMatchesPhrase(r.query, t.phrase));
    const impressions = matched.reduce((a, r) => a + r.impressions, 0);
    const clicks = matched.reduce((a, r) => a + r.clicks, 0);

    // Trend: one point per day, impression-weighted avg position across the
    // phrase's matching queries that day. Only days with impressions.
    const byDate = new Map<string, RawRow[]>();
    for (const r of matched) {
      if (r.impressions <= 0) continue;
      (byDate.get(r.date) ?? byDate.set(r.date, []).get(r.date)!).push(r);
    }
    const trend = [...byDate.entries()]
      .map(([date, rs]) => ({ date, position: weightedPosition(rs) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      phrase: t.phrase,
      slug: t.slug,
      title: t.title,
      impressions,
      clicks,
      ctr: impressions ? clicks / impressions : 0,
      position: weightedPosition(matched),
      appearing: impressions > 0,
      trend,
    };
  });

  // Real visibility first: most impressions at the top; non-appearing phrases sink.
  phrases.sort((a, b) => b.impressions - a.impressions);

  return { status: "ok", phrases, startDate, endDate };
}
