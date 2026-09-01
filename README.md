# vega-star-landing

The Starvega sales-funnel landing page (Next.js App Router). Single funnel page
at `/`, an admin analytics dashboard at `/admin`, PayPal checkout, and an
`/api/track` event sink backed by its own Neon (Postgres) analytics DB.

## Internal / private routes (not in any nav — do not link publicly)

### `/owner-mode` — keep your own visits out of analytics

Visit **`/owner-mode`** once in any browser you use to test the live site. It
flags that browser as the owner by setting a long-lived `starvega_owner` cookie
**and** a matching `localStorage` key (`lib/owner.ts`). While the flag is set:

- **GA4 is disabled** for that browser — an inline script in `app/layout.tsx`
  sets GA's own kill-switch `window['ga-disable-<GA_ID>'] = true` before the GA
  loader runs, so no `page_view` or event is ever collected. (Done client-side
  from the flag so the page stays statically rendered — no server cookie read.)
- **`/api/track` logging is skipped** — both client-side (the beacon in
  `lib/track-client.ts` early-returns) and server-side (the route drops the write
  when the `starvega_owner` cookie is present), so nothing reaches the DB.

To undo it on a browser: visit **`/owner-mode?off=1`**.

This route is `Disallow`ed in `robots.ts` and carries no inbound links, so it is
not crawled or indexed. It relies on IP-independent per-browser flags on purpose
— IP matching is unreliable on residential/mobile connections.

## SEO

- Metadata (title / description / canonical / OG / Twitter) is generated once in
  `lib/seo.ts` (`buildMetadata`) and applied in `app/layout.tsx`.
- `app/sitemap.ts` and `app/robots.ts` are the Next metadata routes that emit
  `/sitemap.xml` and `/robots.txt`.
- Structured data (Organization, Product/Offer, FAQPage) is JSON-LD; the
  Product/Offer schema reads prices from `lib/pricing.ts` so it can't drift.
- Google Search Console verification token: set `GOOGLE_SITE_VERIFICATION` in the
  environment (rendered as the `google-site-verification` meta tag).

## Measurement (Phase 5)

### Google Search Console — one-time setup (needs the Google account)

1. Add the property `https://www.starvega.site` at
   [search.google.com/search-console](https://search.google.com/search-console).
2. Verify with the **HTML tag** method: copy the `content` token Google gives you
   into the `GOOGLE_SITE_VERIFICATION` env var on Vercel and redeploy. (Or verify
   by DNS TXT record — either works; DNS survives redeploys with no env needed.)
3. Under **Sitemaps**, submit `https://www.starvega.site/sitemap.xml`.
4. The `/learn` pages must be deployed before submitting, or their sitemap URLs
   404. They're all live once this branch ships.

### Distinguishing organic search from outreach traffic

- **GA4** already splits this natively: **Reports → Acquisition → Traffic
  acquisition** shows an *Organic Search* channel separate from *Direct* /
  *Referral* / *Social*. Nothing to build.
- **Self-hosted dashboard** (`/admin`): the **Traffic by channel** panel buckets
  every visit into *Organic search / Outreach (IG DM) / Social / Referral /
  Direct* via `lib/source.ts` `classifyChannel()`, derived from the `referrer`
  already stored on each `PageEvent` — no schema change.
- **Tag outreach links** so IG-DM visits are unambiguous: append
  `?utm_source=instagram&utm_medium=dm` to the URL you send in DMs. The client
  captures it as a first-touch source (`lib/source.ts` `sourceSignal()`), stores
  it in the `referrer` field, and the dashboard shows it as **Outreach (IG DM)**.
  Untagged IG visits still land in *Social*; organic search is always its own row.
