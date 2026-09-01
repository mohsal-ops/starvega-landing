"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type VisitorPoint = { day: string; visitors: number };
type ConversionPoint = { day: string; opened: number; submitted: number; rate: number };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2026-08-12" -> "Aug 12". Parsed by hand to avoid any timezone shift.
function tickLabel(day: string): string {
  const [, m, d] = day.split("-");
  return `${MONTHS[Number(m) - 1]} ${Number(d)}`;
}

// Thin the axis ticks so a 30-day range does not crowd the labels.
function tickInterval(len: number): number {
  if (len <= 8) return 0;
  return Math.ceil(len / 8) - 1;
}

function ChartCard({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-bg p-5">
      <h2 className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">{title}</h2>
      <p className="mt-1 text-xs text-ink-soft">{hint}</p>
      <div className="mt-4 h-[220px] w-full">{children}</div>
    </section>
  );
}

function tooltipStyle() {
  return {
    contentStyle: {
      borderRadius: 12,
      border: "1px solid var(--color-line)",
      background: "var(--color-bg)",
      fontSize: 12,
    },
    labelStyle: { color: "var(--color-ink)", fontWeight: 600 },
  };
}

export function TrendCharts({
  visitors,
  conversion,
}: {
  visitors: VisitorPoint[];
  conversion: ConversionPoint[];
}) {
  const interval = tickInterval(visitors.length);
  const axis = { stroke: "var(--color-ink-soft)", fontSize: 11, tickLine: false };

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <ChartCard title="Unique visitors per day" hint="Distinct sessions each day in the selected range.">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visitors} margin={{ top: 6, right: 12, bottom: 0, left: -18 }}>
            <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tickFormatter={tickLabel} interval={interval} {...axis} />
            <YAxis allowDecimals={false} width={40} {...axis} />
            <Tooltip
              {...tooltipStyle()}
              labelFormatter={(l) => tickLabel(String(l))}
              formatter={(v) => [v as number, "Visitors"]}
            />
            <Line
              type="monotone"
              dataKey="visitors"
              stroke="var(--color-ink)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Widget conversion rate per day"
        hint="Share of widget-openers who submitted, each day. A bad day shows here."
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={conversion} margin={{ top: 6, right: 12, bottom: 0, left: -18 }}>
            <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tickFormatter={tickLabel} interval={interval} {...axis} />
            <YAxis allowDecimals={false} width={40} unit="%" domain={[0, "auto"]} {...axis} />
            <Tooltip
              {...tooltipStyle()}
              labelFormatter={(l) => tickLabel(String(l))}
              formatter={(v, _n, p) => {
                const d = p?.payload as ConversionPoint;
                return [`${v}%  (${d.submitted}/${d.opened})`, "Converted"];
              }}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="var(--color-amber)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
