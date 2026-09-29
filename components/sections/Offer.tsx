import { ChoosePlanButton } from "@/components/packs/ChoosePlanButton";
import { PACKAGES, LOYALTY_ADDON_NOTE, formatUsd } from "@/lib/pricing";
import { WidgetCtaButton } from "@/components/WidgetCta";

// SECTION 4 - THE OFFER. The two-part pitch in one place: the site gets you
// orders without commission, the loyalty club brings those customers back.
// Loyalty stats are cited INDUSTRY figures (linked), never Starvega results.
// The free mockup stays the main button; prices are shown for trust as a compact
// strip, and the full plan cards + checkout sit one tap away in the popup.

const SITE_POINTS = [
  "Online ordering on your own site: pickup, delivery, catering",
  "Every order and every dollar in your owner dashboard",
  "Built from your real menu and photos, ranked on Google",
];
const LOYALTY_POINTS = [
  "Customers join at checkout or by QR code (opt-in only)",
  "Birthday offers go out on their own, every year",
  "Slow day? Send a special to your regulars in one tap",
  "Every promo code is tracked, so you see what it earned",
];

function Check() {
  return (
    <span aria-hidden className="mt-0.5 text-amber">
      &#10003;
    </span>
  );
}

export default function Offer() {
  return (
    <section id="offer" className="bg-ink px-4 py-20 text-bg sm:px-10 sm:py-28">
      <div className="mx-auto w-full max-w-6xl">
        <p data-reveal className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-amber">
          The offer
        </p>
        <h2 data-reveal className="max-w-3xl text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
          Get the orders without the commission. Then get them back again.
        </h2>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* 1 - the site */}
          <div data-reveal className="rounded-2xl border border-white/15 bg-white/[0.03] p-6 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/50">1 · Your site</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">Orders come straight to you.</h3>
            <ul className="mt-6 space-y-3">
              {SITE_POINTS.map((p) => (
                <li key={p} className="flex gap-2.5 leading-relaxed text-white/85">
                  <Check />
                  {p}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-white/60">
              One-time price. No monthly platform fee, compared to $150-500 every month for a typical Toast or Square setup.
            </p>
          </div>

          {/* 2 - loyalty */}
          <div data-reveal className="rounded-2xl border border-amber/40 bg-amber/[0.06] p-6 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber">2 · Your loyalty club</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">First-time diners become regulars.</h3>
            <ul className="mt-6 space-y-3">
                {LOYALTY_POINTS.map((p) => (
                  <li key={p} className="flex gap-2.5 leading-relaxed text-white/85">
                    <Check />
                    {p}
                  </li>
                ))}
              </ul>
          </div>
        </div>

        {/* why loyalty matters - cited industry figures */}
        <div data-reveal-stagger className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="border-t border-white/15 pt-5">
            <p className="text-[clamp(2.5rem,8vw,3.75rem)] font-semibold leading-none tracking-[-0.03em] text-amber">65-80%</p>
            <p className="mt-3 max-w-sm leading-relaxed text-white/75">
              of a restaurant&apos;s sales come from its regulars.{" "}
              <a
                href="https://www.restroworks.com/blog/customer-retention-statistics-restaurants/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/50 underline underline-offset-4 hover:text-white"
              >
                Source
              </a>
            </p>
          </div>
          <div className="border-t border-white/15 pt-5">
            <p className="text-[clamp(2.5rem,8vw,3.75rem)] font-semibold leading-none tracking-[-0.03em] text-amber">~20%</p>
            <p className="mt-3 max-w-sm leading-relaxed text-white/75">
              more visits and a bigger check from loyalty members vs. everyone else.{" "}
              <a
                href="https://merchants.doordash.com/en-us/blog/restaurant-loyalty-programs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/50 underline underline-offset-4 hover:text-white"
              >
                Source
              </a>
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start gap-3 rounded-2xl bg-white p-6 text-ink sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-xl font-semibold tracking-tight">See yours before you pay anything.</p>
            <p className="mt-1 text-ink-soft">I&apos;ll design a free mockup of your site and message you within 24h.</p>
          </div>
          <WidgetCtaButton entryPoint="offer" className="w-full shrink-0 sm:w-auto">
            Get my free mockup
          </WidgetCtaButton>
        </div>

        {/* Prices stay visible for trust, as one compact strip; the full cards
            (features + checkout) live in the pricing popup. */}
        <div className="mt-12 rounded-2xl border border-white/15 p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/50">Prices · one-time, no monthly fee</p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {PACKAGES.map((p) => (
              <div key={p.tier} className={`rounded-xl border p-3 sm:p-4 ${p.popular ? "border-amber" : "border-white/15"}`}>
                <p className="text-xs text-white/60 sm:text-sm">{p.label}</p>
                <p className="mt-1 text-xl font-semibold tracking-tight sm:text-3xl">{formatUsd(p.price)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-relaxed text-white/60">{LOYALTY_ADDON_NOTE}</p>
            <ChoosePlanButton variant="outlineOnInk" small className="shrink-0">
              Compare plans
            </ChoosePlanButton>
          </div>
        </div>

        <p className="mt-10 max-w-xl text-sm leading-relaxed text-white/60">
          I build and manage each site personally, so I only take on a handful of restaurants at a time. No fake countdown, no
          expiring deal.
        </p>
      </div>
    </section>
  );
}
