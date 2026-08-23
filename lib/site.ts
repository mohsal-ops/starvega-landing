// Single source of truth for the landing page. Edit here, not in components.
// Placeholders marked TODO must be confirmed before launch.

export const SITE = {
  name: "starvega.digital",
  // Public URL of this landing page (used for canonical + OG). TODO: set to the
  // real domain once chosen (currently the Vercel default is fine to start).
  url: "https://www.starvega.site/",
  tagline: "Restaurant websites with your own zero-commission online ordering.",

  // Final CTA target: Instagram DM deep link. ig.me/m/<handle> opens the DM
  // thread directly on mobile. TODO: confirm the exact handle.
  instagramHandle: "starvega", // TODO confirm
  get instagramDmUrl() {
    return `https://ig.me/m/${this.instagramHandle}`;
  },

  // Footer (mirrors the client siteConfig.footer.copyright getter pattern).
  footer: {
    get copyright() {
      return `© ${new Date().getFullYear()} Starvega. All rights reserved.`;
    },
  },

  // GA4 measurement id is read from NEXT_PUBLIC_GA_MEASUREMENT_ID at runtime
  // (a NEW dedicated property for this page). Nothing hard-coded here.

  // ── PROOF: Southern Jerks case study ──────────────────────────────────────
  // Every number here MUST be confirmed against the live Southern Jerks admin
  // analytics before launch. Do NOT ship unverified figures. `verified: false`
  // is a launch blocker the page can assert against.
  //
  // SCOPE: Southern Jerks has NO active online ordering, so cite it ONLY for
  // what's true there — SEO / search impressions / visitors / ranking. Never add
  // an ordering- or commission-related stat here; the zero-commission ordering
  // claim lives in THE OFFER as a system capability, not as SJ evidence.
  proof: {
    verified: true, // real GA4 + Search Console figures, last 30 days, pulled 2026-08-21
    clientName: "Southern Jerks",
    liveUrl: "https://southernjerkshtx.com", // public site — visitor clicks to verify
    // Curated SEO/traffic subset (6 of the confirmed metrics). Values verbatim —
    // "16K+" stays as-is (real 30d Search Console figure, not a fake precise digit).
    stats: [
      { label: "Search impressions (30d)", value: "16K+" },
      { label: "Visitors (30d)", value: "1,840" },
      { label: "Pageviews (30d)", value: "6,896" },
      { label: "Search clicks (30d)", value: "717" },
      { label: "Avg. Google position", value: "#8.4" },
      { label: "Avg. CTR", value: "8.7%" },
    ] as { label: string; value: string }[],
  },
};
