# 07 — Funnel and pricing (vega-star-landing)

Branch: `feat/funnel-update`. Nothing new is visible on the live page except three new /learn articles and the calculator's collapsed 3-year view (see "Visible changes").

## Built
- **Feature registry** `lib/features.ts` (live / soon / hidden). Existing sold features are registered `live`. All platform-build features (Square/Clover/Toast POS, DoorDash, installable app, order push, monthly report, native app, care plan) are `hidden`.
- **Add-ons** in `lib/pricing.ts` behind `SHOW_ADD_ONS = false`, with prices marked TO CONFIRM BY MOHSAL:
  - POS setup $400–$800
  - native app $1,800–$3,500 + $49–$79/mo
  - care plan $49–$99/mo

  The cards render in `PackCards` (with a "Coming soon" badge for `soon`) and in the JSON-LD (`live` only) once enabled.
- **FAQ** entries can be feature-gated. Square/Clover FAQs were added but stay hidden.
- **/learn** (5 new pages, each with sources and a "checked" date):
  - Visible: "How much do delivery apps really cost a restaurant?", "Toast online ordering vs your own website" (costs + ownership; says plainly we are not a Toast partner), "Owner.com alternatives" (public pricing, a 3-year example, and fair credit for what Owner includes).
  - Hidden until a real-client test: "Online ordering for Square restaurants" and "for Clover restaurants". Hidden pages are not built, not in the sitemap, and 404 if linked.
- **Calculator**: a 3-year platform comparison. Presets are Owner.com Flex ($249/mo + 5%) and Flat ($499/mo), labelled with the "as of" date, and every input is editable.
- **Tracking**: `calc_platform_used` and `learn_source_clicked` added to the client type and the `/api/track` allow-list.
- README updated. Sitemap/robots: the sitemap reads the published pages only. Robots is unchanged.

## Correction to existing copy (important)
The live Toast pages said Toast "adds a $0.99 guest fee" to online orders. **Toast removed that fee in July 2023**, within weeks of adding it, after restaurant backlash (sources on the new page). I rewrote the toast-alternative page, its description and the alternatives table so they no longer claim the fee.

## Verified
- `tsc --noEmit` clean.
- `next build` passes: 35 static pages. Hidden Square/Clover pages are absent from the build output and the sitemap, and the 3 new public pages are present.
- Lint: this repo has no ESLint config (`next lint` isn't set up), so lint was not run.
- `/owner-mode`, checkout and PayPal code were not touched.

## Visible changes once deployed
- 3 new /learn articles and sitemap entries.
- A collapsed "Paying a monthly platform instead? Compare 3 years" button under the profit calculator.
- Corrected Toast copy.

## NEEDS MOHSAL
1. Confirm or replace the add-on prices in `lib/pricing.ts`, then set `SHOW_ADD_ONS = true` only when you want them public.
2. Flip `pos_square` / `pos_clover` in `lib/features.ts` to `live` only after a real restaurant has run each end to end. That publishes the Square/Clover pages and FAQs automatically.
3. Read the Owner.com and Toast pages before deploying. Prices change; the pages show "checked October 11, 2026" and link their sources.
