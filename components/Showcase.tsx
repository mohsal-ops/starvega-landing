"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { SHOWCASE, openShowcase } from "@/lib/showcase";

const STEP_MS = 5200;

// Hero-side showcase: four REAL restaurant sites, one per design, cycling in a
// browser frame (slow pan + crossfade) with the same site on a phone in front.
// Chips underneath name each design and fill up as its turn runs out; hover
// pauses, click jumps. Clicking the frame opens the fullscreen <ShowcaseHost>.
// Only the first capture is priority - the rest load after it (they're ~30-70KB).
export function Showcase({ className = "" }: { className?: string }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (paused || reduced) return;
    const t = setTimeout(() => setI((n) => (n + 1) % SHOWCASE.length), STEP_MS);
    return () => clearTimeout(t);
  }, [i, paused, reduced]);

  const site = SHOWCASE[i];

  return (
    <div className={className} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative pb-8 pr-6">
        <button
          type="button"
          onClick={() => openShowcase(i)}
          aria-label={`Look through ${site.name}'s website`}
          className="group relative block w-full overflow-hidden rounded-[14px] border border-ash bg-surface text-left shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)] transition-shadow hover:shadow-[0_40px_100px_-28px_rgba(0,0,0,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
        >
          <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-ash" />
            <span className="h-2.5 w-2.5 rounded-full bg-ash" />
            <span className="h-2.5 w-2.5 rounded-full bg-ash" />
            <span className="ml-3 truncate font-mono text-xs text-ink-soft">{site.url.replace(/^https?:\/\//, "")}</span>
          </div>
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink">
            {SHOWCASE.map((s, n) => (
              <Image
                key={s.key}
                src={`/showcase/${s.key}-top.webp`}
                alt={n === i ? `${s.name}'s website (${s.style} design)` : ""}
                fill
                priority={n === 0}
                sizes="(min-width: 1024px) 600px, 100vw"
                className={`object-cover object-top transition-opacity duration-[900ms] ease-out ${
                  n === i ? "sc-pan opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <span className="pointer-events-none absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-black shadow-xl transition-transform group-hover:scale-105">
              Look inside <span aria-hidden>→</span>
            </span>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="pointer-events-none absolute bottom-3 left-4 right-[26%] flex items-end gap-3">
              <div key={site.key} className="sc-rise text-white">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/75">Design · {site.style}</p>
                <p className="text-lg font-semibold leading-tight">
                  {site.name} <span className="font-normal text-white/75">· {site.city}</span>
                </p>
              </div>
            </div>
          </div>
        </button>

        {/* the same site on a phone, in front */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 w-[23%] overflow-hidden rounded-[18px] border-[5px] border-ink bg-ink shadow-[0_24px_50px_-18px_rgba(0,0,0,0.6)]"
        >
          <div className="relative aspect-[360/740] w-full">
            {SHOWCASE.map((s, n) => (
              <Image
                key={s.key}
                src={`/showcase/${s.key}-m.webp`}
                alt=""
                fill
                sizes="140px"
                className={`object-cover object-top transition-opacity duration-700 ${n === i ? "opacity-100" : "opacity-0"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* one chip per design */}
      <div className="mt-2 grid grid-cols-4 gap-2" role="tablist" aria-label="Designs">
        {SHOWCASE.map((s, n) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={n === i}
            onClick={() => setI(n)}
            className={`relative overflow-hidden rounded-xl border px-2.5 py-2 text-left transition-colors ${
              n === i ? "border-ink bg-surface" : "border-line bg-paper hover:border-ash"
            }`}
          >
            <span className="block truncate text-[12px] font-semibold text-ink">{s.style}</span>
            <span className="block truncate text-[11px] text-ink-soft">{s.name}</span>
            {n === i && (
              <span
                key={`${i}-${paused}`}
                aria-hidden
                className="absolute bottom-0 left-0 h-[3px] w-full origin-left"
                style={{
                  background: s.accent,
                  animation: paused || reduced ? "none" : `sc-fill ${STEP_MS}ms linear forwards`,
                }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Phones: the hero stays light, so instead of the big frame a swipeable row of
// the four real sites as phone screens. Tap one to open the fullscreen viewer.
export function ShowcaseStrip({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <p className="mb-3 text-[14px] font-medium text-ink">
        4 real restaurants, 4 designs. <span className="text-ink-soft">Tap one to look inside.</span>
      </p>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
        {SHOWCASE.map((s, n) => (
          <button
            key={s.key}
            type="button"
            onClick={() => openShowcase(n)}
            className="w-[38%] shrink-0 snap-start text-left"
            aria-label={`Look through ${s.name}'s website (${s.style} design)`}
          >
            <span className="relative block aspect-[360/740] overflow-hidden rounded-[16px] border-[4px] border-ink bg-ink shadow-md">
              <Image src={`/showcase/${s.key}-m.webp`} alt="" fill sizes="150px" className="object-cover object-top" />
            </span>
            <span className="mt-2 block truncate text-[13px] font-semibold text-ink">{s.style}</span>
            <span className="block truncate text-[12px] text-ink-soft">{s.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
