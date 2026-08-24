import { requireAuth } from "@/lib/auth";
import db from "@/lib/db";
import { logout } from "./_actions/auth";
import { LeadsTable, type Lead } from "./LeadsTable";

export const dynamic = "force-dynamic";

const SECTION_ORDER = ["hook", "agitate", "turn", "proof", "offer", "objections", "cta"];
const WIDGET_STEPS: [string, string][] = [
  ["widget_opened", "Opened"],
  ["widget_submitted", "Submitted"],
  ["preview_generated", "Preview"],
  ["text_cta_clicked", "Texted"],
];

function fmtDuration(secs: number): string {
  if (!secs || secs < 1) return "0s";
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return m ? `${m}m ${s}s` : `${s}s`;
}

async function getData() {
  const [overview] = (await db.$queryRaw`
    SELECT
      (SELECT COUNT(DISTINCT "sessionId")::int FROM "PageEvent") AS total,
      (SELECT COUNT(DISTINCT "sessionId")::int FROM "PageEvent" WHERE "isReturning") AS "returning"
  `) as { total: number; returning: number }[];

  const [dur] = (await db.$queryRaw`
    SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (mx - mn))), 0)::float AS secs
    FROM (SELECT "sessionId", MIN("createdAt") mn, MAX("createdAt") mx FROM "PageEvent" GROUP BY "sessionId") s
  `) as { secs: number }[];

  const referrers = (await db.$queryRaw`
    SELECT COALESCE(NULLIF("referrer", ''), 'Direct') AS ref, COUNT(DISTINCT "sessionId")::int AS c
    FROM "PageEvent" GROUP BY 1 ORDER BY c DESC LIMIT 8
  `) as { ref: string; c: number }[];

  const locations = (await db.$queryRaw`
    SELECT COALESCE(NULLIF("city", ''), 'Unknown') AS city, COALESCE("country", '') AS country, COUNT(DISTINCT "sessionId")::int AS c
    FROM "PageEvent" GROUP BY 1, 2 ORDER BY c DESC LIMIT 15
  `) as { city: string; country: string; c: number }[];

  const sections = (await db.$queryRaw`
    SELECT "sectionId" AS id, COUNT(DISTINCT "sessionId")::int AS c
    FROM "PageEvent" WHERE "eventType" = 'section_view' AND "sectionId" IS NOT NULL GROUP BY 1
  `) as { id: string; c: number }[];

  const widget = (await db.$queryRaw`
    SELECT "eventType" AS t, COUNT(DISTINCT "sessionId")::int AS c
    FROM "PageEvent"
    WHERE "eventType" IN ('widget_opened','widget_submitted','preview_generated','text_cta_clicked')
    GROUP BY 1
  `) as { t: string; c: number }[];

  const leads = await db.instantDemoLead.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return {
    total: overview?.total ?? 0,
    returning: overview?.returning ?? 0,
    avgSecs: dur?.secs ?? 0,
    referrers,
    locations,
    sectionMap: new Map(sections.map((s) => [s.id, s.c])),
    widgetMap: new Map(widget.map((w) => [w.t, w.c])),
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

export default async function AdminDashboard() {
  await requireAuth();
  const d = await getData();
  const newV = d.total - d.returning;
  const pct = (n: number) => (d.total ? Math.round((n / d.total) * 100) : 0);
  const sectionMax = Math.max(1, ...SECTION_ORDER.map((s) => d.sectionMap.get(s) ?? 0));
  const widgetMax = Math.max(1, ...WIDGET_STEPS.map(([k]) => d.widgetMap.get(k) ?? 0));

  return (
    <main className="min-h-screen bg-paper px-6 py-8 sm:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-ink">Starvega analytics</h1>
            <p className="text-sm text-ink-soft">Your marketing site, in numbers.</p>
          </div>
          <form action={logout}>
            <button className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink-soft hover:text-ink">Log out</button>
          </form>
        </header>

        {/* Overview */}
        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Card label="Visitors" value={String(d.total)} sub="unique sessions" />
          <Card label="New" value={`${pct(newV)}%`} sub={`${newV} sessions`} />
          <Card label="Returning" value={`${pct(d.returning)}%`} sub={`${d.returning} sessions`} />
          <Card label="Avg session" value={fmtDuration(d.avgSecs)} sub="first to last event" />
        </section>

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

          {/* Locations */}
          <section className="rounded-2xl border border-line bg-bg p-5">
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Locations</h2>
            <ul className="mt-4 space-y-1.5">
              {d.locations.length === 0 && <li className="text-sm text-ink-soft">No data yet.</li>}
              {d.locations.map((l, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-ink">{[l.city, l.country].filter(Boolean).join(", ")}</span>
                  <span className="tabular-nums text-ink-soft">{l.c}</span>
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
