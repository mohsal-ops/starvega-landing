import { ChoosePlanButton } from "@/components/packs/ChoosePlanButton";
import { PACKAGES, LOYALTY_ADDON_NOTE, formatUsd } from "@/lib/pricing";
import { WidgetCtaButton } from "@/components/WidgetCta";

// SECTION 5 - THE OFFER. What they get, and what it costs against the usual
// monthly-fee platforms (red = what they'd keep paying, green = paid once).
// The free mockup stays the main button; prices are a compact strip, and the
// full plan cards + checkout sit one tap away in the popup.

const SITE_POINTS = [
  "Your own website, built from your real menu and photos",
  "Online ordering: pickup, delivery and catering, zero commission",
  "Owner dashboard: every order and every dollar",
  "Set up to rank on Google, like Southern Jerks",
];

const lowest = Math.min(...PACKAGES.map((p) => p.price));

export default function Offer() {
  return (
    <section id="offer" className="bg-ink px-4 py-20 text-bg sm:px-10 sm:py-28">
      <div className="mx-auto w-full max-w-5xl">
        <p data-reveal className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-amber">
          The offer
        </p>
        <h2 data-reveal className="max-w-3xl text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
          Everything you need to sell direct. Paid once.
        </h2>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <ul data-reveal-stagger className="space-y-4">
            {SITE_POINTS.map((p) => (
              <li key={p} className="flex gap-3 text-lg leading-snug text-white/90">
                <span aria-hidden className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gain-bright text-xs font-bold text-ink">
                  ✓
                </span>
                {p}
              </li>
            ))}
          </ul>

          {/* cost over 3 years: monthly platforms (red) vs paid once (green) */}
          <div data-reveal className="rounded-2xl border border-white/15 bg-white/[0.03] p-6">
            <p className="text-sm text-white/60">What you pay over 3 years</p>
            <div className="mt-5 space-y-5">
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-white/80">Toast / Square style, $150-500 a month</span>
                </div>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-loss-bright">$5,400 - $18,000</p>
                <div className="mt-2 h-3 rounded-full bg-loss-bright/80" />
              </div>
              <div>
                <span className="text-white/80">Starvega, one time</span>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-gain-bright">from {formatUsd(lowest)}</p>
                <div className="mt-2 h-3 w-[8%] min-w-[14px] rounded-full bg-gain-bright" />
              </div>
            </div>
            <p className="mt-5 text-xs text-white/45">Platform fees only, before any commission.</p>
          </div>
        </div>

        <div data-reveal className="mt-12 flex flex-col items-start gap-3 rounded-2xl bg-white p-6 text-ink sm:flex-row sm:items-center sm:justify-between sm:p-8">
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
        <div className="mt-8 rounded-2xl border border-white/15 p-6 sm:p-8">
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
