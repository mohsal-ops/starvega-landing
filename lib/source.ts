// Traffic-source helpers. The goal (SEO brief, Phase 5): make ORGANIC SEARCH
// visits distinguishable from OUTREACH (Instagram DM) visits in the admin
// dashboard, without a schema migration. We reuse the existing PageEvent
// `referrer` column: the client stores a first-touch source signal there, and
// the dashboard buckets it into channels with classifyChannel().
//
// GA4 already does this natively (Acquisition → Traffic acquisition); this is the
// equivalent for the self-hosted dashboard.

// Bucket a stored referrer/source signal into a human channel. Handles raw
// referrer URLs (google.com, instagram.com, …), the "Direct" sentinel, and the
// "utm:<source>:<medium>" signal the client writes for tagged campaign links.
export function classifyChannel(ref: string | null | undefined): string {
  if (!ref || ref === "Direct") return "Direct";
  const r = ref.toLowerCase();

  if (r.startsWith("utm:")) {
    // Tagged link, e.g. add ?utm_source=instagram&utm_medium=dm to outreach DMs.
    if (/instagram|ig[-_:.]|\bdm\b|outreach/.test(r)) return "Outreach (IG DM)";
    const src = r.split(":")[1] || "campaign";
    return `Campaign: ${src}`;
  }
  if (/google\.|bing\.|duckduckgo|yahoo\.|ecosia|baidu|yandex|\/search\?/.test(r))
    return "Organic search";
  if (/instagram\.|ig\.me|l\.instagram|facebook\.|\bfb\.|t\.co|twitter|x\.com|tiktok|linkedin|youtube|reddit|pinterest/.test(r))
    return "Social";
  return "Referral";
}

// Channel display order for the dashboard (organic + outreach first - the two the
// brief cares about separating). Unknown channels sort after these.
export const CHANNEL_ORDER = ["Organic search", "Outreach (IG DM)", "Social", "Referral", "Direct"];

const SRC_KEY = "sv_src";

// First-touch source signal for the current session, written into the track
// payload's `referrer`. Prefers explicit UTM tags on the landing URL, else the
// real document.referrer. Locked in sessionStorage on first load so later
// pageviews in the same visit keep the original attribution.
export function sourceSignal(): string {
  if (typeof window === "undefined") return "";
  try {
    const cached = sessionStorage.getItem(SRC_KEY);
    if (cached !== null) return cached;
  } catch {
    /* ignore */
  }
  let signal = "";
  try {
    const q = new URLSearchParams(window.location.search);
    const utmSource = q.get("utm_source") || q.get("ref");
    if (utmSource) {
      const medium = q.get("utm_medium") || "";
      signal = `utm:${utmSource}:${medium}`.toLowerCase();
    } else {
      signal = document.referrer || "";
    }
  } catch {
    signal = "";
  }
  try {
    sessionStorage.setItem(SRC_KEY, signal);
  } catch {
    /* ignore */
  }
  return signal;
}
