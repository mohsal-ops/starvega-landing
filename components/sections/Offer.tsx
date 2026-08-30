import { Reveal } from "@/components/Reveal";
import { Figure } from "@/components/Figure";
import { PackCards } from "@/components/packs/PackCards";

// SECTION 5 — THE OFFER. Job: state it plainly. One-time price, yours forever,
// no monthly fee and no commission — against a market that charges every month.
// Three packs (Starter/Standard/Pro) sourced from lib/pricing so the numbers can
// never drift from the popup or the checkout. Each card's button goes straight to
// that pack's checkout. Honest capacity, no fake urgency.

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
            One-time price. Yours forever.
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
            Built for people who cook, not people who code. No monthly platform fee and no commission
            on your orders — compare that to $150–500 every month for a typical Toast or Square setup.
          </p>
        </div>

        <Reveal delay={0.05}>
          <div className="mt-14 sm:mt-20">
            <PackCards onInk />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-12 max-w-xl text-sm leading-relaxed text-white/60">
            I build and manage each of these personally, so I only take on a handful of restaurants at
            a time. That is the only limit — no fake countdown, no expiring deal.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
