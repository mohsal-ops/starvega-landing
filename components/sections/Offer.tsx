"use client";

import { Reveal } from "@/components/Reveal";
import { Figure } from "@/components/Figure";
import { PRICING, formatUsd } from "@/lib/pricing";

// SECTION 5 — THE OFFER. Job: state it plainly. Free preview, real dashboard to
// explore, one-time price to go live. Public DEFAULT pricing only (reused from
// pricing.ts so it matches the client trial popups). Honest capacity, no fake
// urgency. The single CTA lives in its own section next — no button here, just
// a soft pointer, so there's exactly one clear action on the page.
const INCLUDED = [
  "A free preview of your site, built with your real menu and branding.",
  "Real dashboard access to click around and see how it works.",
  "Your own online ordering, with no commission on a single order.",
  "You own it: the site, the ordering, your customer list.",
];

export default function Offer() {
  return (
    <section id="offer" className="bg-ink px-6 py-24 text-bg sm:px-10 sm:py-32">
      <div className="mx-auto w-full max-w-5xl">
        <div>
          <p
            data-reveal
            className="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-amber"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
            The offer
          </p>
          <h2
            data-reveal-chars
            className="max-w-3xl text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.02em]"
          >
            See it first, for free. Pay once to go live.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-[240px_1fr] sm:items-center sm:gap-10">
          <Figure
            src="/chef.jpg"
            alt="The person who builds and runs your site"
            ratio="4 / 5"
            onInk
            objectPosition="center 25%"
          />
          <p className="text-[clamp(1.1rem,3vw,1.6rem)] font-medium leading-snug text-white/85">
            Built for people who cook, not people who code. I design, build, and run each site
            personally, so it actually fits your restaurant.
          </p>
        </div>

        <div className="mt-14 grid gap-12 sm:mt-20 sm:grid-cols-[1.1fr_0.9fr] sm:gap-16">
          <Reveal>
            <ul className="space-y-4">
              {INCLUDED.map((item) => (
                <li key={item} className="flex gap-3 text-lg leading-relaxed text-white/85">
                  <span aria-hidden className="mt-1 text-amber">
                    &#10003;
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="rounded-2xl border border-white/15 p-7">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/50">
                One-time, to go live
              </p>
              <div data-price-anchor className="mt-3 flex items-baseline gap-3">
                <span data-price-old className="text-lg text-white/40 line-through">
                  {formatUsd(PRICING.fullPrice)}
                </span>
                <span
                  data-price-new
                  className="text-[clamp(2.75rem,10vw,4rem)] font-semibold leading-none tracking-[-0.03em] text-amber"
                >
                  {formatUsd(PRICING.discountedPrice)}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                No monthly fee. No commission. Compare that to $150-500 every
                month for a typical Toast or Square setup.
              </p>
              <p className="mt-5 border-t border-white/15 pt-5 text-sm leading-relaxed text-white/70">
                I build and manage each of these personally, so I only take on a
                handful of restaurants at a time. That is the only limit. No fake
                countdown, no expiring deal.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <p className="mt-14 max-w-xl text-lg text-white/70 sm:mt-20">
            No checkout, no commitment. It starts with a conversation.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
