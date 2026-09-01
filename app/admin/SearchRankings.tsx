"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import type { RankingsResult, RankPhrase } from "@/lib/search-console";

// "Search rankings" panel. Real Google Search Console data: for each tracked
// /learn phrase, average position / impressions / clicks / CTR over the selected
// range, plus a position trend. Lower position is better, so the trend axis is
// reversed - a line moving UP means the rank is improving.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayLabel = (d: string) => {
  const [, m, day] = d.split("-");
  return `${MONTHS[Number(m) - 1]} ${Number(day)}`;
};
const fmtPos = (n: number) => (n ? n.toFixed(1) : "-");
const fmtCtr = (n: number) => `${(n * 100).toFixed(1)}%`;

// Reversed-axis sparkline: best rank (low number) sits at the top, so an
// upward line = improving. Only rendered when there are enough points.
function RankTrend({ trend }: { trend: RankPhrase["trend"] }) {
  if (trend.length < 3) {
    return <span className="text-xs text-ink-soft">not enough data</span>;
  }
  return (
    <div className="h-9 w-32">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trend} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <YAxis reversed domain={[1, "dataMax"]} hide />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: "1px solid var(--color-line)", background: "var(--color-bg)", fontSize: 11 }}
            labelFormatter={(l) => dayLabel(String(l))}
            formatter={(v) => [`position ${Number(v).toFixed(1)}`, ""]}
          />
          <Line type="monotone" dataKey="position" stroke="var(--color-ink)" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Direction of travel over the range (lower position = better). Returns an arrow
// + label, or null when there is not enough movement/data to be meaningful.
function TrendDelta({ trend }: { trend: RankPhrase["trend"] }) {
  if (trend.length < 2) return null;
  const first = trend[0].position;
  const last = trend[trend.length - 1].position;
  const diff = first - last; // positive = position number went down = improved
  if (Math.abs(diff) < 0.5) return <span className="text-xs text-ink-soft">steady</span>;
  const improved = diff > 0;
  return (
    <span className={`text-xs ${improved ? "text-green-600" : "text-red-600"}`}>
      {improved ? "▲" : "▼"} {Math.abs(diff).toFixed(1)}
    </span>
  );
}

function Configured({ phrases, startDate, endDate }: { phrases: RankPhrase[]; startDate: string; endDate: string }) {
  const appearing = phrases.filter((p) => p.appearing);
  const dormant = phrases.filter((p) => !p.appearing);

  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Search rankings · Google Search Console</h2>
        <span className="text-xs text-ink-soft">{startDate} to {endDate}</span>
      </div>

      {appearing.length === 0 && dormant.length === 0 && (
        <p className="mt-4 text-sm text-ink-soft">No tracked phrases configured.</p>
      )}

      {appearing.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-line text-left font-mono text-[10px] uppercase tracking-wider text-ink-soft">
                <th className="pb-2 pr-3 font-normal">Phrase</th>
                <th className="pb-2 pr-3 text-right font-normal" title="lower is better">Avg position</th>
                <th className="pb-2 pr-3 text-right font-normal">Impressions</th>
                <th className="pb-2 pr-3 text-right font-normal">Clicks</th>
                <th className="pb-2 pr-3 text-right font-normal">CTR</th>
                <th className="pb-2 pr-3 text-right font-normal">Trend (↑ better)</th>
              </tr>
            </thead>
            <tbody>
              {appearing.map((p) => (
                <tr key={p.slug} className="border-b border-line/60">
                  <td className="py-2.5 pr-3">
                    <span className="text-ink">{p.phrase}</span>
                  </td>
                  <td className="py-2.5 pr-3 text-right">
                    <span className="tabular-nums font-medium text-ink">{fmtPos(p.position)}</span>{" "}
                    <TrendDelta trend={p.trend} />
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums text-ink">{p.impressions.toLocaleString()}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums text-ink">{p.clicks.toLocaleString()}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums text-ink-soft">{fmtCtr(p.ctr)}</td>
                  <td className="py-2.5 pr-3">
                    <div className="flex justify-end">
                      <RankTrend trend={p.trend} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Phase 5: honest empty state - not hidden. */}
      {dormant.length > 0 && (
        <div className="mt-5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">Not yet appearing in search</p>
          <p className="mt-1 text-xs text-ink-soft">Tracked, but zero impressions in this period. Useful to know: these topics are published but not yet surfacing.</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {dormant.map((p) => (
              <li key={p.slug} className="rounded-lg border border-line bg-paper px-2.5 py-1 text-xs text-ink-soft">
                {p.phrase}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function NotConfigured() {
  return (
    <>
      <h2 className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Search rankings · Google Search Console</h2>
      <div className="mt-4 rounded-xl border border-dashed border-line bg-paper p-5">
        <p className="text-sm font-medium text-ink">Not connected yet.</p>
        <p className="mt-1 text-sm text-ink-soft">
          Add a Google service account with read access to the Search Console property, then set{" "}
          <code className="rounded bg-ink/5 px-1 py-0.5 text-xs">GOOGLE_SERVICE_ACCOUNT_EMAIL</code> and{" "}
          <code className="rounded bg-ink/5 px-1 py-0.5 text-xs">GOOGLE_SERVICE_ACCOUNT_KEY</code>. Real ranking data (average
          position, impressions, clicks) lives only in Search Console - it is never available from GA4.
        </p>
      </div>
    </>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <>
      <h2 className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Search rankings · Google Search Console</h2>
      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm font-medium text-red-800">Could not load Search Console data.</p>
        <p className="mt-1 break-words text-sm text-red-700">{message}</p>
        <p className="mt-2 text-xs text-red-700/80">
          Common causes: the service account is not added as a user on the property, the Search Console API is not enabled,
          or the property URL does not match exactly.
        </p>
      </div>
    </>
  );
}

export function SearchRankings({ data }: { data: RankingsResult }) {
  return (
    <section className="rounded-2xl border border-line bg-bg p-5">
      {data.status === "not_configured" && <NotConfigured />}
      {data.status === "error" && <ErrorState message={data.message} />}
      {data.status === "ok" && <Configured phrases={data.phrases} startDate={data.startDate} endDate={data.endDate} />}
    </section>
  );
}
