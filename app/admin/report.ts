import type { Range } from "./range";
import { fmtDuration, timeAgo } from "./format";

// Builds the plain-text/markdown visitor report. Written to be read top to
// bottom by someone who has never seen this data - each section says what it
// means before the numbers, and the funnels show reach relative to the step
// above (where people are lost), not just raw counts.

export interface ReportInput {
  range: Range;
  total: number;
  newV: number;
  returning: number;
  avgSecs: number;
  // In funnel order (top of page first).
  sections: { label: string; c: number }[];
  widget: { label: string; c: number }[];
  channels: { channel: string; c: number }[];
  locations: { place: string; c: number; lastVisit: string }[];
  devices: { device: string; c: number }[];
}

const pct = (n: number, of: number) => (of ? Math.round((n / of) * 100) : 0);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function buildReport(i: ReportInput): string {
  const L: string[] = [];
  const today = new Date().toISOString().slice(0, 10);

  L.push(`# Starvega marketing site - visitor report`);
  L.push("");
  L.push(`**Date range:** ${i.range.label} (${i.range.from} to ${i.range.to})`);
  L.push(`**Generated:** ${today}`);
  L.push("");

  // Audience
  L.push(`## 1. Audience`);
  L.push(`- **Total unique visitors:** ${i.total}`);
  L.push(`- **New visitors:** ${i.newV} (${pct(i.newV, i.total)}%)`);
  L.push(`- **Returning visitors:** ${i.returning} (${pct(i.returning, i.total)}%)`);
  L.push(`- **Average time on site:** ${fmtDuration(i.avgSecs)} (first to last action in a visit)`);
  L.push("");

  // Section drop-off
  L.push(`## 2. Where visitors drop off (page sections)`);
  L.push(
    `The landing page is one long page with sections in this order. "Reached" is how many visitors scrolled far enough to see that section. "Kept from above" is the share of the previous section's visitors who made it here - a low number means people are leaving at that point.`,
  );
  L.push("");
  L.push(`| # | Section | Reached | Kept from above |`);
  L.push(`|---|---------|--------:|----------------:|`);
  let worst = { from: "", to: "", keep: 101 };
  let anyOver = false;
  i.sections.forEach((s, idx) => {
    const prev = idx === 0 ? null : i.sections[idx - 1];
    const keep = prev ? pct(s.c, prev.c) : null;
    if (keep !== null && keep > 100) anyOver = true;
    if (prev && prev.c > 0 && keep !== null && keep < worst.keep) {
      worst = { from: prev.label, to: s.label, keep };
    }
    L.push(`| ${idx + 1} | ${s.label} | ${s.c} | ${keep === null ? "- (top)" : `${keep}%`} |`);
  });
  L.push("");
  if (worst.from) {
    L.push(`**Biggest drop-off:** ${worst.from} -> ${worst.to}, where only ${worst.keep}% continued.`);
    L.push("");
  }
  if (anyOver) {
    L.push(
      `_A value above 100% means more visitors were recorded at that section than the one above it. This is normal: short sections can be scrolled past too fast to register, and some visitors jump straight down the page, so the sections are not a strict step-by-step funnel._`,
    );
    L.push("");
  }

  // Widget funnel
  L.push(`## 3. Instant-preview widget funnel`);
  L.push(
    `The steps a visitor goes through in the instant-demo widget, from opening it to texting to finish. "Of openers" is the share of everyone who opened the widget that reached this step.`,
  );
  L.push("");
  L.push(`| Step | Sessions | Of previous step | Of openers |`);
  L.push(`|------|---------:|-----------------:|-----------:|`);
  const openers = i.widget[0]?.c ?? 0;
  i.widget.forEach((w, idx) => {
    const prev = idx === 0 ? null : i.widget[idx - 1];
    const ofPrev = prev ? `${pct(w.c, prev.c)}%` : "- (start)";
    const ofOpen = idx === 0 ? "100%" : `${pct(w.c, openers)}%`;
    L.push(`| ${w.label} | ${w.c} | ${ofPrev} | ${ofOpen} |`);
  });
  L.push("");

  // Channels
  L.push(`## 4. Top traffic channels`);
  L.push(`Where visitors came from, by number of unique visits.`);
  L.push("");
  if (i.channels.length === 0) L.push(`_No channel data in this range._`);
  i.channels.slice(0, 3).forEach((c, idx) =>
    L.push(`${idx + 1}. **${c.channel}** - ${c.c} ${c.c === 1 ? "visit" : "visits"}`),
  );
  L.push("");

  // Locations by recency
  L.push(`## 5. Most recent visitor locations`);
  L.push(`The last five places a visitor came from, newest first.`);
  L.push("");
  if (i.locations.length === 0) L.push(`_No location data in this range._`);
  i.locations.slice(0, 5).forEach((l, idx) =>
    L.push(`${idx + 1}. **${l.place}** - last visit ${timeAgo(l.lastVisit)} (${l.c} ${l.c === 1 ? "visitor" : "visitors"})`),
  );
  L.push("");

  // Device split
  L.push(`## 6. Device split`);
  const devTotal = i.devices.reduce((a, d) => a + d.c, 0);
  const unknown = i.devices.find((d) => d.device === "unknown")?.c ?? 0;
  L.push(`How visitors browsed, by unique visit.`);
  L.push("");
  if (devTotal === 0) {
    L.push(`_No device data in this range._`);
  } else {
    ["mobile", "desktop", "tablet", "unknown"].forEach((key) => {
      const c = i.devices.find((d) => d.device === key)?.c ?? 0;
      if (c > 0) L.push(`- **${cap(key)}:** ${c} (${pct(c, devTotal)}%)`);
    });
    if (unknown > 0) {
      L.push("");
      L.push(`_Note: "Unknown" visits were recorded before device tracking was added, so early data understates the mobile/desktop split._`);
    }
  }
  L.push("");

  return L.join("\n");
}
