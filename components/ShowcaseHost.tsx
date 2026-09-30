"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { SHOWCASE, setPickedStyle, subscribeShowcase, takePendingShowcase } from "@/lib/showcase";
import { openPreview } from "@/lib/preview";
import { openPackModal } from "@/lib/pack-modal";
import { openWidget } from "@/lib/widget-cta";
import { track } from "@/lib/track-client";

// Fullscreen "look inside" viewer for the four real client sites. Shows the
// whole homepage as a tall capture you scroll through (client sites refuse to be
// iframed, and a capture never fires their visit alerts or skews their
// analytics). Tabs / arrow keys switch site; "Open live" goes to the real thing.
// Mounted once, lazily (see LazyEnhancements).
export default function ShowcaseHost() {
  const [open, setOpen] = useState<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const show = useCallback((n: number) => {
    setOpen(n);
    track("preview_opened", { sectionId: `showcase:${SHOWCASE[n].key}` });
  }, []);

  useEffect(() => {
    const early = takePendingShowcase();
    if (early !== null) show(early);
    return subscribeShowcase(show);
  }, [show]);

  const close = useCallback(() => setOpen(null), []);
  const go = useCallback((d: number) => setOpen((n) => (n === null ? n : (n + d + SHOWCASE.length) % SHOWCASE.length)), []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [open]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, go]);

  if (open === null) return null;
  const s = SHOWCASE[open];
  setPickedStyle(s.style);

  const toMockup = () => {
    close();
    setTimeout(() => openWidget("preview"), 50);
  };
  const toDemo = () => {
    close();
    setTimeout(() => openPreview("site"), 50);
  };

  return (
    <div className="fixed inset-0 z-[285] flex flex-col bg-[#111]" role="dialog" aria-modal="true" aria-label="Real restaurant sites">
      {/* top bar: one tab per design */}
      <div className="shrink-0 border-b border-white/10 bg-black px-3 py-2.5 sm:px-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-full border border-white/15 bg-white/5 p-1 [scrollbar-width:none]">
            {SHOWCASE.map((x, n) => (
              <button
                key={x.key}
                type="button"
                onClick={() => setOpen(n)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  n === open ? "bg-white text-black" : "text-white/60 hover:text-white"
                }`}
              >
                {x.style}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="hidden min-h-[40px] items-center rounded-full border border-white/25 px-4 text-sm font-semibold text-white hover:bg-white/10 sm:inline-flex"
            >
              Open live ↗
            </a>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/15"
            >
              <span aria-hidden className="text-xl leading-none">&times;</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* the site, scrollable top to bottom */}
        <div ref={scroller} className="relative min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-[1000px] overflow-hidden rounded-[12px] border border-white/10 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-line bg-surface px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-ash" />
              <span className="h-2.5 w-2.5 rounded-full bg-ash" />
              <span className="h-2.5 w-2.5 rounded-full bg-ash" />
              <span className="ml-3 truncate font-mono text-xs text-ink-soft">{s.url.replace(/^https?:\/\//, "")}</span>
            </div>
            <Image
              key={s.key}
              src={`/showcase/${s.key}-full.webp`}
              alt={`${s.name}'s full homepage (${s.style} design)`}
              width={1000}
              height={5000}
              sizes="(min-width: 1024px) 1000px, 100vw"
              className="h-auto w-full"
              priority
            />
          </div>
          <p className="mx-auto mt-4 max-w-[1000px] text-center font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
            Homepage capture · the live site has the menu, ordering &amp; more
          </p>
        </div>

        {/* side panel (desktop) */}
        <aside className="hidden w-[330px] shrink-0 flex-col border-l border-white/10 bg-black p-6 text-white lg:flex">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
            Design {open + 1} of {SHOWCASE.length}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight" style={{ color: s.accent }}>
            {s.style}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-white/75">{s.vibe}.</p>
          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold">{s.name}</p>
            <p className="text-sm text-white/60">{s.city} · a real restaurant, live now</p>
          </div>
          <ul className="mt-5 space-y-2 text-sm text-white/75">
            <li>✓ Your logo, colors, menu &amp; photos</li>
            <li>✓ Commission-free online ordering</li>
            <li>✓ Switch designs any time, same content</li>
          </ul>

          <div className="mt-auto space-y-2.5">
            <button
              type="button"
              onClick={toMockup}
              className="min-h-[48px] w-full rounded-xl bg-amber text-sm font-semibold text-ink hover:bg-[#f0904a]"
            >
              Get a free mockup in this style
            </button>
            <button
              type="button"
              onClick={openPackModal}
              className="min-h-[44px] w-full rounded-xl border border-white/25 text-sm font-semibold text-white hover:bg-white/10"
            >
              See prices
            </button>
            <button type="button" onClick={toDemo} className="min-h-[40px] w-full text-sm text-white/70 underline-offset-4 hover:text-white hover:underline">
              Click through a working demo (order, dashboard) →
            </button>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => go(-1)} className="min-h-[40px] flex-1 rounded-lg bg-white/5 text-sm text-white/80 hover:bg-white/10">
                ← Prev
              </button>
              <button type="button" onClick={() => go(1)} className="min-h-[40px] flex-1 rounded-lg bg-white/5 text-sm text-white/80 hover:bg-white/10">
                Next →
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* phones: the ask at thumb height */}
      <div className="flex shrink-0 gap-2 border-t border-white/10 bg-black p-3 lg:hidden">
        <a href={s.url} target="_blank" rel="noreferrer" className="grid min-h-[48px] flex-1 place-items-center rounded-xl border border-white/25 text-sm font-semibold text-white">
          Open live ↗
        </a>
        <button type="button" onClick={toMockup} className="min-h-[48px] flex-[1.5] rounded-xl bg-amber text-sm font-semibold text-ink">
          Free mockup in this style
        </button>
      </div>
    </div>
  );
}
