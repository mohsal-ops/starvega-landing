"use client";

import { CountUp } from "@/components/CountUp";
import { Reveal } from "@/components/Reveal";
import { SITE } from "@/lib/site";

// SECTION 4 — PROOF (Southern Jerks). Heaviest visual weight on the page. 100%
// REAL: live-site + analytics screenshots and current numbers, plus a link so a
// visitor can verify independently. Nothing here is generated or invented.
//
// Hard gate: until SITE.proof.verified is flipped true (after confirming live
// numbers) the section renders an obvious DRAFT placeholder, never fake stats.

// Parse "11,240" / "$2,010" / "18+" into pieces so real numbers count up.
function parseStat(value: string) {
  const m = value.match(/^(\D*)([\d,]+)(\D*)$/);
  if (!m) return null;
  return { prefix: m[1], to: parseInt(m[2].replace(/,/g, ""), 10), suffix: m[3] };
}

function BrowserFrame({
  label,
  src,
  alt,
}: {
  label: string;
  src?: string;
  alt: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-[0_20px_60px_-25px_rgba(13,15,20,0.35)]">
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="ml-3 truncate font-mono text-[11px] text-ink-soft">{label}</span>
      </div>
      {/* Reserved aspect ratio prevents layout shift while the image loads. */}
      <div className="relative aspect-[16/10] w-full bg-paper">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-ink-soft/60">
              {alt}
            </p>
          </div>
        )}
      </div>
    </div>
  );
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
            {proof.clientName} is live, taking its own orders, and you can check
            the numbers yourself.
          </h2>
        </Reveal>

        {!ready && (
          <Reveal>
            <p className="mt-8 inline-block rounded-lg border border-amber/40 bg-amber/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-amber-deep">
              Draft — real {proof.clientName} numbers &amp; screenshots pending before launch
            </p>
          </Reveal>
        )}

        <Reveal delay={0.05}>
          <div className="mt-12 grid gap-5 sm:mt-16 sm:grid-cols-2">
            <BrowserFrame
              label={proof.liveUrl || "southernjerks.com"}
              alt={`Live ${proof.clientName} website home page with online ordering`}
            />
            <BrowserFrame
              label="dashboard · analytics"
              alt={`${proof.clientName} admin analytics dashboard showing real traffic`}
            />
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 sm:mt-20 sm:grid-cols-4">
          {(ready
            ? proof.stats
            : [
                { label: "Impressions (30d)", value: "—" },
                { label: "Visitors (30d)", value: "—" },
                { label: "Commission paid", value: "$0" },
                { label: "Owned by", value: "them" },
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
