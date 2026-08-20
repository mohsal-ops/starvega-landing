// Single source of truth for the landing page. Edit here, not in components.
// Placeholders marked TODO must be confirmed before launch.

export const SITE = {
  name: "Starvega",
  // Public URL of this landing page (used for canonical + OG). TODO: set to the
  // real domain once chosen (currently the Vercel default is fine to start).
  url: "https://starvega.vercel.app",
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
  proof: {
    verified: false, // flip to true only after confirming live numbers
    clientName: "Southern Jerks",
    liveUrl: "", // TODO: real live site URL (visitor clicks to verify)
    // Fill from the real dashboard right before launch. Left null until then.
    stats: [] as { label: string; value: string }[],
  },
};
