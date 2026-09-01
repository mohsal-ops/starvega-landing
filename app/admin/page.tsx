import { requireAuth } from "@/lib/auth";
import db from "@/lib/db";
import { logout } from "./_actions/auth";
import { LeadsTable, type Lead } from "./LeadsTable";
import { classifyChannel, CHANNEL_ORDER } from "@/lib/source";
import { resolveRange, enumerateDays } from "./range";
import { RangeControl } from "./RangeControl";
import { TrendCharts } from "./TrendCharts";
import { ReportButton } from "./ReportButton";
import { buildReport } from "./report";
import { fmtDuration, timeAgo } from "./format";

export const dynamic = "force-dynamic";

const SECTION_ORDER = ["hook", "agitate", "turn", "proof", "offer", "objections", "cta"];
const WIDGET_STEPS: [string, string][] = [
  ["widget_opened", "Opened"],
  ["widget_submitted", "Submitted"],
  ["preview_generated", "Preview"],
  ["preview_opened", "Live preview opened"],
  ["pack_selected", "Plan chosen"],
  ["text_cta_clicked", "Texted"],
];

// Every query below is scoped to [start, end]. The window is resolved from the
// URL search params (see ./range) and defaults to the last 30 days.
async function getData(start: Date, end: Date) {
  const [overview] = (await db.$queryRaw`
    SELECT
      (SELECT COUNT(DISTINCT "sessionId")::int FROM "PageEvent" WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}) AS total,
      (SELECT COUNT(DISTINCT "sessionId")::int FROM "PageEvent" WHERE "isReturning" AND "createdAt" >= ${start} AND "createdAt" <= ${end}) AS "returning"
  `) as { total: number; returning: number }[];

  const [dur] = (await db.$queryRaw`
    SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (mx - mn))), 0)::float AS secs
    FROM (SELECT "sessionId", MIN("createdAt") mn, MAX("createdAt") mx FROM "PageEvent" WHERE "createdAt" >= ${start} AND "createdAt" <= ${end} GROUP BY "sessionId") s
  `) as { secs: number }[];

  const referrers = (await db.$queryRaw`
    SELECT COALESCE(NULLIF("referrer", ''), 'Direct') AS ref, COUNT(DISTINCT "sessionId")::int AS c
    FROM "PageEvent" WHERE "createdAt" >= ${start} AND "createdAt" <= ${end} GROUP BY 1 ORDER BY c DESC LIMIT 8
  `) as { ref: string; c: number }[];

  // Traffic by channel: bucket every stored referrer/source into a channel so
  // organic search is distinguishable from outreach (see lib/source.ts). Pageview
  // events only, to count visits rather than in-page interactions.
  const refCounts = (await db.$queryRaw`
    SELECT COALESCE(NULLIF("referrer", ''), 'Direct') AS ref, COUNT(DISTINCT "sessionId")::int AS c
    FROM "PageEvent" WHERE "eventType" = 'pageview' AND "createdAt" >= ${start} AND "createdAt" <= ${end} GROUP BY 1
  `) as { ref: string; c: number }[];
  const channelMap = new Map<string, number>();
  for (const { ref, c } of refCounts) {
    const ch = classifyChannel(ref);
    channelMap.set(ch, (channelMap.get(ch) ?? 0) + c);
  }
  const channels = [...channelMap.entries()]
    .map(([channel, c]) => ({ channel, c }))
    .sort((a, b) => {
      const ai = CHANNEL_ORDER.indexOf(a.channel);
      const bi = CHANNEL_ORDER.indexOf(b.channel);
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      return b.c - a.c;
    });

  // Locations sorted by recency (most recent visitor first), not just volume.
  // lastVisit = the newest event from that city/country, so the panel answers
  // "when did the last visitor from that place show up".
  const locationsRaw = (await db.$queryRaw`
    SELECT COALESCE(NULLIF("city", ''), 'Unknown') AS city, COALESCE("country", '') AS country,
           COUNT(DISTINCT "sessionId")::int AS c, MAX("createdAt") AS "lastVisit"
    FROM "PageEvent" WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
    GROUP BY 1, 2 ORDER BY "lastVisit" DESC LIMIT 15
  `) as { city: string; country: string; c: number; lastVisit: Date }[];
  const locations = locationsRaw.map((l) => ({ ...l, lastVisit: l.lastVisit.toISOString() }));

  const sections = (await db.$queryRaw`
    SELECT "sectionId" AS id, COUNT(DISTINCT "sessionId")::int AS c
    FROM "PageEvent" WHERE "eventType" = 'section_view' AND "sectionId" IS NOT NULL AND "createdAt" >= ${start} AND "createdAt" <= ${end} GROUP BY 1
  `) as { id: string; c: number }[];

  const widget = (await db.$queryRaw`
    SELECT "eventType" AS t, COUNT(DISTINCT "sessionId")::int AS c
    FROM "PageEvent"
    WHERE "eventType" IN ('widget_opened','widget_submitted','preview_generated','preview_opened','pack_selected','text_cta_clicked')
      AND "createdAt" >= ${start} AND "createdAt" <= ${end}
    GROUP BY 1
  `) as { t: string; c: number }[];

  // Device split (mobile / tablet / desktop / unknown) by unique session.
  const deviceRows = (await db.$queryRaw`
    SELECT COALESCE(NULLIF("device", ''), 'unknown') AS device, COUNT(DISTINCT "sessionId")::int AS c
    FROM "PageEvent" WHERE "createdAt" >= ${start} AND "createdAt" <= ${end} GROUP BY 1
  `) as { device: string; c: number }[];
  const deviceMap = new Map(deviceRows.map((r) => [r.device, r.c]));

  // Daily unique visitors across the window (UTC day buckets).
  const dailyVisitorsRaw = (await db.$queryRaw`
    SELECT to_char(("createdAt" AT TIME ZONE 'UTC')::date, 'YYYY-MM-DD') AS day,
           COUNT(DISTINCT "sessionId")::int AS c
    FROM "PageEvent" WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
    GROUP BY 1 ORDER BY 1
  `) as { day: string; c: number }[];

  // Daily widget funnel: opened vs submitted sessions, so a per-day conversion
  // rate can be charted and a bad day is visible instead of buried in the total.
  const dailyWidgetRaw = (await db.$queryRaw`
    SELECT to_char(("createdAt" AT TIME ZONE 'UTC')::date, 'YYYY-MM-DD') AS day,
           COUNT(DISTINCT "sessionId") FILTER (WHERE "eventType" = 'widget_opened')::int AS opened,
           COUNT(DISTINCT "sessionId") FILTER (WHERE "eventType" = 'widget_submitted')::int AS submitted
    FROM "PageEvent"
    WHERE "eventType" IN ('widget_opened','widget_submitted') AND "createdAt" >= ${start} AND "createdAt" <= ${end}
    GROUP BY 1 ORDER BY 1
  `) as { day: string; opened: number; submitted: number }[];

  // Pad both series to every day in the window so zero-traffic days still render.
  const visitorsByDay = new Map(dailyVisitorsRaw.map((r) => [r.day, r.c]));
  const widgetByDay = new Map(dailyWidgetRaw.map((r) => [r.day, r]));
  const days = enumerateDays(start, end);
  const dailyVisitors = days.map((day) => ({ day, visitors: visitorsByDay.get(day) ?? 0 }));
  const dailyConversion = days.map((day) => {
    const w = widgetByDay.get(day);
    const opened = w?.opened ?? 0;
    const submitted = w?.submitted ?? 0;
    return { day, opened, submitted, rate: opened ? Math.round((submitted / opened) * 100) : 0 };
  });

  const leads = await db.instantDemoLead.findMany({
    where: { createdAt: { gte: start, lte: end } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return {
    total: overview?.total ?? 0,
    returning: overview?.returning ?? 0,
    avgSecs: dur?.secs ?? 0,
    referrers,
    channels,
    locations,
    sectionMap: new Map(sections.map((s) => [s.id, s.c])),
    widgetMap: new Map(widget.map((w) => [w.t, w.c])),
    deviceMap,
    dailyVisitors,
    dailyConversion,
    leads: leads.map((l) => ({ ...l, createdAt: l.createdAt.toISOString() })) as Lead[],
  };
}

function Card({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-bg p-5">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-soft">{sub}</p>}
    </div>
  );
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAuth();
  const sp = await searchParams;
  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);
  const range = resolveRange({ range: str(sp.range), from: str(sp.from), to: str(sp.to) });
  const d = await getData(range.start, range.end);
  const newV = d.total - d.returning;
  const pct = (n: number) => (d.total ? Math.round((n / d.total) * 100) : 0);
  const sectionMax = Math.max(1, ...SECTION_ORDER.map((s) => d.sectionMap.get(s) ?? 0));
  const widgetMax = Math.max(1, ...WIDGET_STEPS.map(([k]) => d.widgetMap.get(k) ?? 0));

  // Pre-build the exportable report for the current range (markdown, no JSON).
  const reportMd = buildReport({
    range,
    total: d.total,
    newV,
    returning: d.returning,
    avgSecs: d.avgSecs,
    sections: SECTION_ORDER.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), c: d.sectionMap.get(s) ?? 0 })),
    widget: WIDGET_STEPS.map(([k, label]) => ({ label, c: d.widgetMap.get(k) ?? 0 })),
    channels: d.channels,
    locations: d.locations.map((l) => ({
      place: [l.city, l.country].filter(Boolean).join(", ") || "Unknown",
      c: l.c,
      lastVisit: l.lastVisit,
    })),
    devices: [...d.deviceMap.entries()].map(([device, c]) => ({ device, c })),
  });

  return (
    <main className="min-h-screen bg-paper px-6 py-8 sm:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-ink">Starvega analytics</h1>
            <p className="text-sm text-ink-soft">Your marketing site, in numbers. · {range.label}</p>
          </div>
          <div className="flex items-center gap-2">
            <ReportButton markdown={reportMd} rangeLabel={range.label} />
            <form action={logout}>
              <button className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink-soft hover:text-ink">Log out</button>
            </form>
          </div>
        </header>

        {/* Date range */}
        <div className="mt-5">
          <RangeControl range={range} />
        </div>

        {/* Overview */}
        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Card label="Visitors" value={String(d.total)} sub="unique sessions" />
          <Card label="New" value={`${pct(newV)}%`} sub={`${newV} sessions`} />
          <Card label="Returning" value={`${pct(d.returning)}%`} sub={`${d.returning} sessions`} />
          <Card label="Avg session" value={fmtDuration(d.avgSecs)} sub="first to last event" />
        </section>

        {/* Trends */}
        <div className="mt-3">
          <TrendCharts visitors={d.dailyVisitors} conversion={d.dailyConversion} />
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {/* Section funnel */}
          <section className="rounded-2xl border border-line bg-bg p-5">
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Funnel: section reach</h2>
            <div className="mt-4 space-y-2.5">
              {SECTION_ORDER.map((s) => {
                const c = d.sectionMap.get(s) ?? 0;
                return (
                  <div key={s} className="flex items-center gap-3">
                    <span className="w-20 shrink-0 text-sm capitalize text-ink">{s}</span>
                    <div className="h-6 flex-1 overflow-hidden rounded bg-paper">
                      <div className="h-full rounded bg-ink" style={{ width: `${(c / sectionMax) * 100}%` }} />
                    </div>
                    <span className="w-10 shrink-0 text-right text-sm tabular-nums text-ink">{c}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Widget funnel */}
          <section className="rounded-2xl border border-line bg-bg p-5">
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Funnel: instant preview widget</h2>
            <div className="mt-4 space-y-2.5">
              {WIDGET_STEPS.map(([k, label]) => {
                const c = d.widgetMap.get(k) ?? 0;
                return (
                  <div key={k} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-sm text-ink">{label}</span>
                    <div className="h-6 flex-1 overflow-hidden rounded bg-paper">
                      <div className="h-full rounded bg-amber" style={{ width: `${(c / widgetMax) * 100}%` }} />
                    </div>
                    <span className="w-10 shrink-0 text-right text-sm tabular-nums text-ink">{c}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Locations - sorted by most recent visitor */}
          <section className="rounded-2xl border border-line bg-bg p-5">
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Locations · most recent first</h2>
            <ul className="mt-4 space-y-1.5">
              {d.locations.length === 0 && <li className="text-sm text-ink-soft">No data yet.</li>}
              {d.locations.map((l, i) => (
                <li key={i} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-ink">{[l.city, l.country].filter(Boolean).join(", ")}</span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="tabular-nums text-ink-soft" title="last visit">{timeAgo(l.lastVisit)}</span>
                    <span className="w-8 text-right tabular-nums text-ink" title="unique visitors">{l.c}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Traffic by channel - organic search vs outreach vs the rest */}
          <section className="rounded-2xl border border-line bg-bg p-5">
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Traffic by channel</h2>
            <ul className="mt-4 space-y-1.5">
              {d.channels.length === 0 && <li className="text-sm text-ink-soft">No data yet.</li>}
              {d.channels.map((ch, i) => (
                <li key={i} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-ink">{ch.channel}</span>
                  <span className="tabular-nums text-ink-soft">{ch.c}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Referrers */}
          <section className="rounded-2xl border border-line bg-bg p-5">
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Top referrers</h2>
            <ul className="mt-4 space-y-1.5">
              {d.referrers.length === 0 && <li className="text-sm text-ink-soft">No data yet.</li>}
              {d.referrers.map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-ink">{r.ref}</span>
                  <span className="tabular-nums text-ink-soft">{r.c}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Leads */}
        <section className="mt-3 rounded-2xl border border-line bg-bg p-5">
          <h2 className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Instant-demo leads</h2>
          <div className="mt-4">
            <LeadsTable leads={d.leads} />
          </div>
        </section>
      </div>
    </main>
  );
}
