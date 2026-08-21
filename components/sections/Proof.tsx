"use client";

import { CountUp } from "@/components/CountUp";
import { Reveal } from "@/components/Reveal";
import { SITE } from "@/lib/site";

// SECTION 4 — PROOF (Southern Jerks). Real, current SEO/traffic numbers plus a
// link to the live site so a visitor can verify independently. Nothing here is
// generated or invented. Stats are gated on SITE.proof.verified.
//
// No screenshots: the admin dashboard is login-gated (not visitor-verifiable),
// so proof is the real stat callouts + the clickable live-site link.

// Parse "11,240" / "$2,010" / "18+" into pieces so real numbers count up.
function parseStat(value: string) {
  const m = value.match(/^(\D*)([\d,]+)(\D*)$/);
  if (!m) return null;
  return { prefix: m[1], to: parseInt(m[2].replace(/,/g, ""), 10), suffix: m[3] };
}

export default function Proof() {
  const { proof } = SITE;
  const ready = proof.verified && proof.stats.length > 0;

  return (
    <section id="proof" className="border-t border-line bg-paper px-6 py-24 sm:px-10 sm:py-32">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <p className="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
            Real restaurant. Real numbers.
          </p>
          <h2 className="max-w-3xl text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
            {proof.clientName} is live and ranking in Google search, and you can
            check the numbers yourself.
          </h2>
        </Reveal>

        {!ready && (
          <Reveal>
            <p className="mt-8 inline-block rounded-lg border border-amber/40 bg-amber/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-amber-deep">
              Draft — real {proof.clientName} numbers pending before launch
            </p>
          </Reveal>
        )}

        <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 sm:mt-16 sm:grid-cols-3">
          {(ready
            ? proof.stats
            : [
                { label: "Search impressions (30d)", value: "—" },
                { label: "Visitors (30d)", value: "—" },
                { label: "Keywords ranking", value: "—" },
                { label: "Avg. Google position", value: "—" },
              ]
          ).map((s, i) => {
            const parsed = ready ? parseStat(s.value) : null;
            return (
              <Reveal key={s.label} delay={i * 0.06}>
                <div className="border-t-2 border-ink pt-4">
                  <div className="text-[clamp(2.25rem,7vw,3.5rem)] font-semibold leading-none tracking-[-0.03em] text-ink tabular-nums">
                    {parsed ? (
                      <CountUp to={parsed.to} prefix={parsed.prefix} suffix={parsed.suffix} />
                    ) : (
                      s.value
                    )}
                  </div>
                  <p className="mt-2 text-sm text-ink-soft">{s.label}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-14 sm:mt-20">
            {proof.liveUrl ? (
              <a
                href={proof.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border-b-2 border-amber pb-1 text-lg font-semibold text-ink transition-colors hover:text-amber-deep"
              >
                See {proof.clientName} live and check it yourself
                <span aria-hidden>↗</span>
              </a>
            ) : (
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-ink-soft/60">
                Live link added before launch
              </span>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
