// Date-range selection for the admin dashboard. Presets (Today / 7d / 30d) and a
// custom from/to window, all resolved to a concrete [start, end] pair that every
// dashboard query is filtered by. Boundaries are computed in UTC (the DB stores
// createdAt in UTC via now()), so "Today" means the current UTC day.

export type RangeKey = "today" | "7d" | "30d" | "custom";

export interface Range {
  key: RangeKey;
  start: Date;
  end: Date;
  label: string;
  from: string; // YYYY-MM-DD, for the <input type="date"> defaults
  to: string;
}

const DAY_MS = 86_400_000;
const YMD = /^\d{4}-\d{2}-\d{2}$/;

function utcDayStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export interface RangeParams {
  range?: string;
  from?: string;
  to?: string;
}

// Resolve the URL search params into a concrete window. A valid custom from/to
// pair wins; otherwise the named preset; otherwise the 30-day default.
export function resolveRange(sp: RangeParams): Range {
  const now = new Date();
  const todayStart = utcDayStart(now);

  if (sp.from && sp.to && YMD.test(sp.from) && YMD.test(sp.to)) {
    const start = new Date(`${sp.from}T00:00:00.000Z`);
    const end = new Date(`${sp.to}T23:59:59.999Z`);
    if (start <= end) {
      return { key: "custom", start, end, label: `${sp.from} to ${sp.to}`, from: sp.from, to: sp.to };
    }
  }

  const key: RangeKey = sp.range === "today" || sp.range === "7d" ? sp.range : "30d";
  if (key === "today") {
    return { key, start: todayStart, end: now, label: "Today", from: ymd(todayStart), to: ymd(now) };
  }
  const days = key === "7d" ? 7 : 30;
  const start = new Date(todayStart.getTime() - (days - 1) * DAY_MS);
  return { key, start, end: now, label: `Last ${days} days`, from: ymd(start), to: ymd(now) };
}

// Every UTC day (YYYY-MM-DD) from start to end inclusive. Used to pad the daily
// trend series so a zero-traffic day still shows on the chart instead of being
// skipped. Capped at 366 days as a guard against an absurd custom range.
export function enumerateDays(start: Date, end: Date): string[] {
  const days: string[] = [];
  let cursor = utcDayStart(start).getTime();
  const last = utcDayStart(end).getTime();
  for (let i = 0; cursor <= last && i <= 366; i++, cursor += DAY_MS) {
    days.push(ymd(new Date(cursor)));
  }
  return days;
}
