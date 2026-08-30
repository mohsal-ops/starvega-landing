"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { openPackModal } from "@/lib/pack-modal";
import { track } from "@/lib/track-client";

// The live demo (starvega-demo) shown two ways:
//  1) An inline window near the end of the funnel autoplaying a looping tour
//     video of the site, with a dark gradient rising from the bottom and the two
//     entry buttons sitting INSIDE the window.
//  2) A persistent floating "Preview" button that opens the real demo FULLSCREEN
//     to navigate the actual site.
//
// The owner dashboard opens in a NEW TAB (first-party), because the read-only
// preview session relies on a cookie that browsers refuse to send inside a
// cross-site iframe (third-party). A new tab is first-party, so it always loads
// and stays read-only.

const DEMO_URL = (process.env.NEXT_PUBLIC_DEMO_URL || "https://starvega-demo.vercel.app").replace(/\/$/, "");
const SITE_SRC = `${DEMO_URL}/`;
const DASHBOARD_SRC = `${DEMO_URL}/api/preview/enter`; // read-only owner dashboard

export function PreviewEmbed() {
  const [fullscreen, setFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // React doesn't reliably set the DOM `muted` property from the `muted` prop,
  // which makes browsers block autoplay. Set it explicitly and kick off play().
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, []);

  const open = useCallback(() => {
    setFullscreen(true);
    track("preview_opened", { sectionId: "site" });
  }, []);

  const close = useCallback(() => setFullscreen(false), []);

  const openDashboard = useCallback(() => {
    track("preview_dashboard_opened");
    window.open(DASHBOARD_SRC, "_blank", "noopener,noreferrer");
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [fullscreen, close]);

  return (
    <>
      {/* Inline preview window */}
      <section id="live-preview" className="scroll-mt-20 bg-paper px-6 py-24 sm:px-10 sm:py-32">
        <div className="mx-auto w-full max-w-5xl">
          <p className="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-amber">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
            See it live
          </p>
          <h2 className="max-w-3xl text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-ink">
            A real, working site - not a screenshot.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
            This is a full demo restaurant running on the exact platform you get. Open it to click into
            the menu, order flow, catering, and even the owner dashboard.
          </p>

          <div className="mt-10 overflow-hidden rounded-[10px] border border-ash bg-surface">
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-ash" />
              <span className="h-2.5 w-2.5 rounded-full bg-ash" />
              <span className="h-2.5 w-2.5 rounded-full bg-ash" />
              <span className="ml-3 truncate font-mono text-xs text-ink-soft">{DEMO_URL.replace(/^https?:\/\//, "")}</span>
            </div>

            {/* 16:9 looping tour video, cover-fit so it fills the window (no gaps).
                Poster (the live demo hero) shows for the split second before play. */}
            <div className="relative aspect-video w-full bg-ink">
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                poster={`${DEMO_URL}/samples/bowl-salmon.jpg`}
                aria-label="A short tour of the live demo site"
              >
                <source src="/preview-loop.mp4" type="video/mp4" />
              </video>

              {/* Dark gradient rising from the bottom to the middle */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

              {/* Entry buttons, inside the window, black/white */}
              <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={open}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-[10px] bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-sm transition-transform hover:bg-white/90 active:scale-[0.99]"
                >
                  Explore the live preview
                </button>
                <button
                  type="button"
                  onClick={openDashboard}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1 rounded-[10px] border border-white/70 bg-black/30 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/50"
                >
                  See the owner dashboard ↗
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating "Preview" button - always available while scrolling */}
      {!fullscreen && (
        <button
          type="button"
          onClick={open}
          className="fixed bottom-5 right-5 z-[190] inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-white/10 transition-transform hover:scale-[1.03] active:scale-[0.99]"
          aria-label="Open the live preview"
        >
          <span aria-hidden className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber" />
          Preview
        </button>
      )}

      {/* Fullscreen overlay - control bar in its own row, the website iframe below. */}
      {fullscreen && (
        <div className="fixed inset-0 z-[280] flex flex-col bg-ink">
          <div className="shrink-0 bg-gradient-to-b from-black via-black to-black/90 px-4 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate font-mono text-xs text-white/70">Live demo · sample content</p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openDashboard}
                  className="inline-flex min-h-[40px] items-center justify-center gap-1 rounded-[10px] border border-white/40 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  Owner dashboard ↗
                </button>
                <button
                  type="button"
                  onClick={openPackModal}
                  className="inline-flex min-h-[40px] items-center justify-center rounded-[10px] bg-white px-4 py-2 text-sm font-semibold text-black transition-transform hover:bg-white/90 active:scale-[0.99]"
                >
                  Choose your plan
                </button>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close preview"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/40 bg-black/40 text-white transition-colors hover:bg-white/10"
                >
                  <span aria-hidden className="text-xl leading-none">&times;</span>
                </button>
              </div>
            </div>
          </div>

          <div className="relative flex-1">
            <iframe
              src={SITE_SRC}
              title="Live demo restaurant site"
              className="h-full w-full bg-bg"
            />
          </div>
        </div>
      )}
    </>
  );
}
