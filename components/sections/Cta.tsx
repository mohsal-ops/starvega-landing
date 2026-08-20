"use client";

import { Reveal } from "@/components/Reveal";
import { SITE } from "@/lib/site";
import { track } from "@/lib/track";

// SECTION 7 — SINGLE CTA. One action only: open an Instagram DM to start a
// conversation (not a checkout — a real conversation closes it). Repeated once,
// nothing competing. Amber-on-ink text meets contrast; the tap target is a full
// thumb-sized block.
export default function Cta() {
  return (
    <section id="cta" className="bg-ink px-6 py-28 text-bg sm:px-10 sm:py-36">
      <div className="mx-auto w-full max-w-3xl text-center">
        <Reveal>
          <h2 className="text-[clamp(2.25rem,7vw,4rem)] font-semibold leading-[1.03] tracking-[-0.02em]">
            Want to see yours, for free?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/70">
            I&apos;ll build a preview with your menu and send it over. No cost, no
            commitment — just message me and we&apos;ll start there.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <a
            href={SITE.instagramDmUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("cta_click", { location: "cta_section" })}
            className="mt-10 inline-flex min-h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-amber px-8 py-5 text-lg font-semibold text-ink shadow-sm transition-transform hover:bg-[#f0904a] active:scale-[0.99] sm:w-auto"
          >
            Get your free preview
            <span aria-hidden>&#8594;</span>
          </a>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.15em] text-white/40">
            Opens a message on Instagram
          </p>
        </Reveal>
      </div>
    </section>
  );
}
