import type { Range } from "./range";

// Server-rendered date-range picker: preset links (Today / 7d / 30d) plus a
// native GET form for a custom from/to window. No client JS - each choice is a
// URL that re-runs the dashboard's queries. Preset links omit from/to, so they
// always override an active custom range.

const PRESETS: { key: string; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
];

export function RangeControl({ range }: { range: Range }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex overflow-hidden rounded-lg border border-line">
        {PRESETS.map((p) => {
          const active = range.key === p.key;
          return (
            <a
              key={p.key}
              href={`/admin?range=${p.key}`}
              className={`px-3 py-1.5 text-sm transition-colors ${
                active ? "bg-ink text-bg" : "text-ink-soft hover:text-ink"
              }`}
            >
              {p.label}
            </a>
          );
        })}
      </div>
      <form method="get" action="/admin" className="flex flex-wrap items-center gap-1.5">
        <input
          type="date"
          name="from"
          defaultValue={range.from}
          aria-label="From date"
          className="rounded-lg border border-line bg-bg px-2 py-1 text-sm text-ink"
        />
        <span className="text-sm text-ink-soft">to</span>
        <input
          type="date"
          name="to"
          defaultValue={range.to}
          aria-label="To date"
          className="rounded-lg border border-line bg-bg px-2 py-1 text-sm text-ink"
        />
        <button
          className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
            range.key === "custom"
              ? "border-ink bg-ink text-bg"
              : "border-line text-ink-soft hover:text-ink"
          }`}
        >
          Apply
        </button>
      </form>
    </div>
  );
}
