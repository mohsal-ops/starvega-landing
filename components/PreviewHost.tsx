"use client";

import { useCallback, useEffect, useState } from "react";
import { DEMO_URL, openPreview, subscribePreview, takePendingPreview, type PreviewView } from "@/lib/preview";
import { openPackModal } from "@/lib/pack-modal";
import { openWidget } from "@/lib/widget-cta";
import { track } from "@/lib/track-client";

// The live demo (starvega-demo) in a fullscreen viewer: Website / Owner dashboard
// toggle, and the page's main ask ("Get my free mockup") in the bar. The iframe
// only exists while open, so the demo costs nothing on page load. Also renders a
// small floating "Live demo" button, desktop only (on phones it would cover the
// form; they get a text link under it instead). Mounted once, lazily (see
// LazyEnhancements).
export default function PreviewHost() {
  const [view, setView] = useState<PreviewView | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const show = (v: PreviewView) => {
      setView(v);
      track("preview_opened", { sectionId: v });
    };
    const early = takePendingPreview();
    if (early) show(early);
    return subscribePreview(show);
  }, []);
  useEffect(() => setLoaded(false), [view]);

  const close = useCallback(() => setView(null), []);
  const toMockup = () => {
    close();
    // let the overlay unmount (body scroll restored) before scrolling
    setTimeout(() => openWidget("preview"), 50);
  };
  const switchTo = (v: PreviewView) => {
    if (v === "dashboard" && view !== "dashboard") track("preview_dashboard_opened");
    setView(v);
  };

  useEffect(() => {
    if (!view) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [view, close]);

  if (!view) {
    return (
      <button
        type="button"
        onClick={() => openPreview("site")}
        className="fixed bottom-5 right-5 z-[190] hidden min-h-[48px] lg:inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-xl"
        aria-label="Open the live demo"
      >
        <span className="h-2 w-2 rounded-full bg-amber" />
        Live demo
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[280] flex flex-col bg-ink" role="dialog" aria-modal="true" aria-label="Live demo">
      <div className="shrink-0 border-b border-white/10 bg-black px-3 py-2.5 sm:px-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center rounded-full border border-white/15 bg-white/5 p-1">
            {(["site", "dashboard"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => switchTo(k)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:px-3.5 ${
                  view === k ? "bg-white text-black" : "text-white/60 hover:text-white"
                }`}
              >
                {k === "site" ? "Website" : "Owner dashboard"}
              </button>
            ))}
          </div>
          <p className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-white/50 lg:block">Live demo · sample restaurant</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openPackModal}
              className="hidden min-h-[40px] items-center rounded-full border border-white/25 px-4 text-sm font-semibold text-white hover:bg-white/10 sm:inline-flex"
            >
              See prices
            </button>
            <button
              type="button"
              onClick={toMockup}
              className="hidden min-h-[40px] items-center rounded-full bg-amber px-4 text-sm font-semibold text-ink hover:bg-[#f0904a] sm:inline-flex"
            >
              Get my free mockup
            </button>
            <button
              type="button"
              onClick={close}
              aria-label="Close live demo"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/15"
            >
              <span aria-hidden className="text-xl leading-none">&times;</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex-1 bg-bg">
        <iframe
          key={view}
          src={view === "site" ? `${DEMO_URL}/` : `${DEMO_URL}/admin`}
          title={view === "site" ? "Live demo restaurant site" : "Read-only owner dashboard"}
          onLoad={() => setLoaded(true)}
          className="h-full w-full bg-bg"
        />
        {!loaded && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 bg-bg">
            <span className="h-9 w-9 animate-spin rounded-full border-2 border-ash border-t-amber" />
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">Loading the live demo…</p>
          </div>
        )}
      </div>

      <div className="flex shrink-0 gap-2 border-t border-white/10 bg-black p-3 sm:hidden">
        <button type="button" onClick={openPackModal} className="min-h-[48px] flex-1 rounded-xl border border-white/25 text-sm font-semibold text-white">
          See prices
        </button>
        <button type="button" onClick={toMockup} className="min-h-[48px] flex-[1.4] rounded-xl bg-amber text-sm font-semibold text-ink">
          Get my free mockup
        </button>
      </div>
    </div>
  );
}
