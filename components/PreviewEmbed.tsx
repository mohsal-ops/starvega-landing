"use client";

import { useCallback, useEffect, useState } from "react";
import { openPackModal } from "@/lib/pack-modal";
import { track } from "@/lib/track-client";

// The live demo (starvega-demo) shown two ways:
//  1) An inline framed preview near the end of the funnel ("scroll to the end and
//     you see it").
//  2) A persistent floating "Preview" button that opens it FULLSCREEN, where the
//     visitor can navigate the real site, flip to the read-only owner dashboard,
//     and hit a "Choose your plan" CTA at any time. Close returns them to the page.
//
// The demo is a separate deployed app, so we can't inject CTAs *inside* the
// iframe (cross-origin); instead the fullscreen chrome keeps the dashboard toggle
// and the plan CTA visible over it at all times.

const DEMO_URL = (process.env.NEXT_PUBLIC_DEMO_URL || "https://starvega-demo.vercel.app").replace(/\/$/, "");
const SITE_SRC = `${DEMO_URL}/`;
const DASHBOARD_SRC = `${DEMO_URL}/api/preview/enter`; // read-only owner dashboard

export function PreviewEmbed() {
  const [fullscreen, setFullscreen] = useState(false);
  const [view, setView] = useState<"site" | "dashboard">("site");

  const open = useCallback((initial: "site" | "dashboard" = "site") => {
    setView(initial);
    setFullscreen(true);
    track("preview_opened", { sectionId: initial });
  }, []);

  const close = useCallback(() => setFullscreen(false), []);

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

  const showDashboard = () => {
    setView("dashboard");
    track("preview_dashboard_opened");
  };

  return (
    <>
      {/* Inline preview section */}
      <section id="live-preview" className="scroll-mt-20 bg-paper px-6 py-24 sm:px-10 sm:py-32">
        <div className="mx-auto w-full max-w-5xl">
          <p className="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-amber">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
            See it live
          </p>
          <h2 className="max-w-3xl text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-ink">
            A real, working site — not a screenshot.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
            This is a full demo restaurant running on the exact platform you get. Click into the menu,
            order flow, catering, and even the owner dashboard.
          </p>

          <div className="mt-10 overflow-hidden rounded-[10px] border border-ash bg-surface">
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-ash" />
              <span className="h-2.5 w-2.5 rounded-full bg-ash" />
              <span className="h-2.5 w-2.5 rounded-full bg-ash" />
              <span className="ml-3 truncate font-mono text-xs text-ink-soft">{DEMO_URL.replace(/^https?:\/\//, "")}</span>
            </div>
            <div className="relative aspect-[16/10] w-full bg-bg">
              <iframe
                src={SITE_SRC}
                title="Live demo restaurant site"
                loading="lazy"
                className="h-full w-full"
              />
              {/* Click-catcher so scrolling the page doesn't get trapped; opens fullscreen to interact. */}
              <button
                type="button"
                onClick={() => open("site")}
                className="absolute inset-0 grid place-items-center bg-transparent transition-colors hover:bg-ink/5"
                aria-label="Open the live preview fullscreen"
              >
                <span className="rounded-[10px] bg-ink/85 px-5 py-3 text-sm font-semibold text-bg opacity-0 transition-opacity hover:opacity-100">
                  Click to explore fullscreen →
                </span>
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => open("site")}
              className="inline-flex min-h-[52px] items-center justify-center rounded-[10px] bg-amber px-6 py-3 text-base font-semibold text-ink transition-transform hover:bg-[#f0904a] active:scale-[0.99]"
            >
              Explore the live preview
            </button>
            <button
              type="button"
              onClick={() => open("dashboard")}
              className="inline-flex min-h-[52px] items-center justify-center rounded-[10px] border border-ink/25 px-6 py-3 text-base font-semibold text-ink transition-colors hover:border-ink/50"
            >
              See the owner dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Floating "Preview" button — always available while scrolling */}
      {!fullscreen && (
        <button
          type="button"
          onClick={() => open("site")}
          className="fixed bottom-5 right-5 z-[190] inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-bg shadow-lg ring-1 ring-white/10 transition-transform hover:scale-[1.03] active:scale-[0.99]"
          aria-label="Open the live preview"
        >
          <span aria-hidden className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber" />
          Preview
        </button>
      )}

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div className="fixed inset-0 z-[280] flex flex-col bg-ink">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-ink px-4 py-2.5">
            <div className="flex items-center gap-1.5 rounded-full border border-white/15 p-1">
              <button
                type="button"
                onClick={() => setView("site")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  view === "site" ? "bg-amber text-ink" : "text-white/70 hover:text-white"
                }`}
              >
                Website
              </button>
              <button
                type="button"
                onClick={showDashboard}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  view === "dashboard" ? "bg-amber text-ink" : "text-white/70 hover:text-white"
                }`}
              >
                Owner dashboard
              </button>
            </div>

            <p className="hidden truncate font-mono text-xs text-white/50 sm:block">
              Live demo · sample content
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openPackModal}
                className="inline-flex min-h-[40px] items-center justify-center rounded-[10px] bg-amber px-4 py-2 text-sm font-semibold text-ink transition-transform hover:bg-[#f0904a] active:scale-[0.99]"
              >
                Choose your plan
              </button>
              <button
                type="button"
                onClick={close}
                aria-label="Close preview"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
              >
                <span aria-hidden className="text-xl leading-none">&times;</span>
              </button>
            </div>
          </div>

          <div className="relative flex-1">
            <iframe
              key={view}
              src={view === "site" ? SITE_SRC : DASHBOARD_SRC}
              title={view === "site" ? "Live demo restaurant site" : "Read-only owner dashboard"}
              className="h-full w-full bg-bg"
            />
          </div>
        </div>
      )}
    </>
  );
}
