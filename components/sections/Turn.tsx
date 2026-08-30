"use client";

import { Reveal } from "@/components/Reveal";
import { ArrowLink } from "@/components/ArrowLink";
import { SiteMockup } from "@/components/SiteMockup";

// SECTION 3 - THE TURN. Job: signal there's a way out, briefly. Just enough to
// create relief after AGITATE. No price, no hard sell - the full case is PROOF
// and THE OFFER next.
const PILLARS = [
  { k: "One-time", v: "One price, paid once. Not a monthly fee that never ends." },
  { k: "Zero commission", v: "Orders come straight to you. No cut on anything, ever." },
  { k: "You own it", v: "Your site, your ordering, your customer list. Forever." },
];

export default function Turn() {
  return (
    <section id="turn" className="border-t border-line bg-bg px-6 py-24 sm:px-10 sm:py-32">
      <div className="mx-auto w-full max-w-5xl">
        <div>
          <p
            data-reveal
            className="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-ink-soft"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
            There is a way off it
          </p>
          <h2
            data-reveal-chars
            className="max-w-3xl text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.02em]"
          >
            A real website with your own online ordering, and a dashboard that
            shows you <span className="text-amber">every order and every dollar</span>.
          </h2>
        </div>

        <Reveal className="mt-14 sm:mt-20">
          <SiteMockup className="mx-auto max-w-xl shadow-[0_1px_0_var(--color-line)]" />
        </Reveal>

        <div className="mt-14 grid gap-8 sm:mt-20 sm:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.k} delay={i * 0.08}>
              <div className="border-t-2 border-ink pt-4">
                <h3 className="text-xl font-semibold tracking-tight">{p.k}</h3>
                <p className="mt-2 text-base leading-relaxed text-ink-soft">{p.v}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div data-reveal className="mt-16 sm:mt-20">
          <ArrowLink
            href="#proof"
            arrow="↓"
            className="font-mono text-xs uppercase tracking-[0.18em] text-ink-soft"
          >
            Here is one already doing it
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}
