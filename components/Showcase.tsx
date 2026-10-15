"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SHOWCASE, displayUrl, openShowcase } from "@/lib/showcase";

const STEP_MS = 4600;
const N = SHOWCASE.length;

// Cycle through the designs while the block is on screen (and the visitor
// isn't hovering / hasn't asked for reduced motion). Nothing runs off-screen.
function useDeck(step: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const running = visible && !paused && !reduced;
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setI((n) => (n + 1) % N), step);
    return () => clearTimeout(t);
  }, [i, running, step]);

  return { ref, i, setI, paused, setPaused, running };
}

// Where each card sits in the deck, relative to the current one: 0 = front,
// 1-2 peek out behind, the previous card flies off to the left, the rest wait
// hidden at the back. Transforms + opacity only, so it stays smooth and cheap.
function deckStyle(pos: number): React.CSSProperties {
  if (pos === 0) return { transform: "translate3d(0,0,0) scale(1)", opacity: 1, zIndex: 30 };
  if (pos === 1) return { transform: "translate3d(0,-6%,0) scale(0.93)", opacity: 1, zIndex: 20 };
  if (pos === 2) return { transform: "translate3d(0,-11.5%,0) scale(0.86)", opacity: 1, zIndex: 10 };
  if (pos === N - 1) return { transform: "translate3d(-115%,4%,0) rotate(-9deg) scale(0.96)", opacity: 0, zIndex: 40 };
  return { transform: "translate3d(0,-15%,0) scale(0.8)", opacity: 0, zIndex: 0 };
}

// Hero-side showcase: the REAL restaurant sites as a deck of browser windows.
// Every few seconds the front site flies off and the next slides forward, while
// the same site flips in on the phone in front and the glow behind takes the
// design's colour. Chips name each design and fill as its turn runs out; hover
// pauses, click jumps, clicking the window opens the fullscreen viewer.
export function Showcase({ className = "" }: { className?: string }) {
  const { ref, i, setI, paused, setPaused, running } = useDeck(STEP_MS);
  const site = SHOWCASE[i];

  return (
    <div ref={ref} className={className} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative pb-8 pr-6 pt-[9%]">
        {/* colour glow behind the deck */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[12%] top-[18%] bottom-[10%] rounded-full opacity-35 blur-[70px] transition-colors duration-700"
          style={{ background: site.accent }}
        />

        <div className="relative aspect-[1200/800] w-full">
          {SHOWCASE.map((s, n) => {
            const pos = (n - i + N) % N;
            const front = pos === 0;
            return (
              <button
                key={s.key}
                type="button"
                tabIndex={front ? 0 : -1}
                aria-hidden={!front}
                onClick={() => (front ? openShowcase(n) : setI(n))}
                aria-label={front ? `Look through ${s.name}'s website` : undefined}
                className="group absolute inset-0 flex origin-top flex-col overflow-hidden rounded-[14px] border border-ash bg-surface text-left shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)] transition-[transform,opacity] duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
                style={deckStyle(pos)}
              >
                <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-ash" />
                  <span className="h-2.5 w-2.5 rounded-full bg-ash" />
                  <span className="h-2.5 w-2.5 rounded-full bg-ash" />
                  <span className="ml-3 truncate font-mono text-xs text-ink-soft">{displayUrl(s.url)}</span>
                </div>
                <div className="relative w-full flex-1 overflow-hidden bg-ink">
                  <Image
                    src={`/showcase/${s.key}-top.webp`}
                    alt={front ? `${s.name}'s website (${s.style} design)` : ""}
                    fill
                    priority={n === 0}
                    sizes="(min-width: 1024px) 600px, 100vw"
                    className={`object-cover object-top ${front ? "sc-pan" : ""}`}
                  />
                  {/* back cards sit in shadow */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-ink transition-opacity duration-700"
                    style={{ opacity: pos === 1 ? 0.18 : pos === 2 ? 0.34 : 0 }}
                  />
                  {front && (
                    <>
                      <span className="pointer-events-none absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-black shadow-xl transition-transform group-hover:scale-105">
                        Look inside <span aria-hidden>→</span>
                      </span>
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div key={s.key} className="sc-rise pointer-events-none absolute bottom-3 left-4 right-[26%] text-white">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/75">Design · {s.style}</p>
                        <p className="text-lg font-semibold leading-tight">
                          {s.name} <span className="font-normal text-white/75">· {s.city}</span>
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* the same site on a phone, in front - flips to each new design */}
        <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 z-50 w-[23%] [perspective:900px]">
          <div
            key={site.key}
            className="sc-flip overflow-hidden rounded-[18px] border-[5px] border-ink bg-ink shadow-[0_24px_50px_-18px_rgba(0,0,0,0.6)]"
          >
            <div className="relative aspect-[360/740] w-full">
              <Image src={`/showcase/${site.key}-m.webp`} alt="" fill sizes="140px" className="object-cover object-top" />
            </div>
          </div>
        </div>
      </div>

      {/* one chip per design */}
      <div className="mt-2 grid gap-2" style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }} role="tablist" aria-label="Designs">
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
                style={{ background: s.accent, animation: running ? `sc-fill ${STEP_MS}ms linear forwards` : "none" }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Phone position in the fanned deck: centre one big, neighbours tilted out to
// the sides behind it, the rest tucked away. Same transform-only trick.
function fanStyle(pos: number): React.CSSProperties {
  const d = pos > N / 2 ? pos - N : pos; // -2..2
  if (d === 0) return { transform: "translate3d(-50%,0,0) scale(1)", opacity: 1, zIndex: 30 };
  if (Math.abs(d) === 1)
    return { transform: `translate3d(calc(-50% + ${d * 62}%),5%,0) rotate(${d * 7}deg) scale(0.82)`, opacity: 1, zIndex: 20 };
  return { transform: `translate3d(calc(-50% + ${d * 70}%),9%,0) rotate(${d * 11}deg) scale(0.7)`, opacity: 0, zIndex: 10 };
}

// Phones: the real sites as a fanned deck of phones. It shuffles on its own,
// swipe left/right to flip through, tap the middle one to look inside.
export function ShowcaseStrip({ className = "" }: { className?: string }) {
  const { ref, i, setI, running } = useDeck(3600);
  const touchX = useRef<number | null>(null);
  const site = SHOWCASE[i];
  const go = (d: number) => setI((n) => (n + d + N) % N);

  return (
    <div ref={ref} className={className}>
      <p className="mb-3 text-[14px] font-medium text-ink">
        {N} real restaurants, {N} designs. <span className="text-ink-soft">Swipe, or tap to look inside.</span>
      </p>
      <div
        className="relative mx-auto h-[380px] w-full touch-pan-y select-none overflow-hidden"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 35) go(dx < 0 ? 1 : -1);
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[50px] transition-colors duration-700"
          style={{ background: site.accent }}
        />
        {SHOWCASE.map((s, n) => {
          const pos = (n - i + N) % N;
          return (
            <button
              key={s.key}
              type="button"
              tabIndex={pos === 0 ? 0 : -1}
              onClick={() => (pos === 0 ? openShowcase(n) : setI(n))}
              aria-label={pos === 0 ? `Look through ${s.name}'s website (${s.style} design)` : `Show the ${s.style} design`}
              className="absolute left-1/2 top-2 w-[44%] max-w-[170px] origin-bottom transition-[transform,opacity] duration-[750ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
              style={fanStyle(pos)}
            >
              <span className="relative block aspect-[360/740] overflow-hidden rounded-[18px] border-[4px] border-ink bg-ink shadow-[0_20px_40px_-16px_rgba(0,0,0,0.55)]">
                <Image src={`/showcase/${s.key}-m.webp`} alt="" fill sizes="170px" className="object-cover object-top" />
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-1 flex items-center justify-between gap-3">
        <div key={site.key} className="sc-rise min-w-0">
          <p className="truncate text-[15px] font-semibold text-ink">{site.style}</p>
          <p className="truncate text-[12px] text-ink-soft">
            {site.name} · {site.city}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5" role="tablist" aria-label="Designs">
          {SHOWCASE.map((s, n) => (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={n === i}
              aria-label={s.style}
              onClick={() => setI(n)}
              className="relative h-2 overflow-hidden rounded-full bg-ash transition-[width] duration-500"
              style={{ width: n === i ? 28 : 8 }}
            >
              {n === i && (
                <span
                  key={`${i}-${running}`}
                  className="absolute inset-0 origin-left"
                  style={{ background: s.accent, animation: running ? "sc-fill 3600ms linear forwards" : "none" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
