"use client";

import { useEffect, useRef } from "react";
import { DEMO_URL, openPreview } from "@/lib/preview";

// Hero-side window onto the live demo: a browser frame with a looping tour video.
// The whole window opens the fullscreen demo. Speed rules: the poster paints
// first, and the video isn't even requested until the page has finished loading
// (and never under reduced motion / data saver) - it can't delay first paint.
export function PreviewWindow({ className = "" }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    // Hidden on phones (lg:block parent) - never download the tour there.
    if (!v.offsetParent || window.matchMedia("(prefers-reduced-motion: reduce)").matches || conn?.saveData) return;
    const start = () => {
      v.src = "/preview-loop-sm.mp4";
      v.play().catch(() => {});
    };
    if (document.readyState === "complete") setTimeout(start, 600);
    else window.addEventListener("load", () => setTimeout(start, 600), { once: true });
  }, []);

  return (
    <button
      type="button"
      onClick={() => openPreview("site")}
      aria-label="Open the live demo site"
      className={`group relative block w-full overflow-hidden rounded-[14px] border border-ash bg-surface text-left shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)] transition-shadow hover:shadow-[0_40px_100px_-28px_rgba(0,0,0,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-ash" />
        <span className="h-2.5 w-2.5 rounded-full bg-ash" />
        <span className="h-2.5 w-2.5 rounded-full bg-ash" />
        <span className="ml-3 truncate font-mono text-xs text-ink-soft">{DEMO_URL.replace(/^https?:\/\//, "")}</span>
      </div>
      <div className="relative aspect-video w-full overflow-hidden bg-ink">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover object-top"
          loop
          muted
          playsInline
          preload="none"
          poster="/preview-poster.jpg"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/5" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="inline-flex items-center gap-2.5 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black shadow-2xl ring-4 ring-white/25 transition-transform group-hover:scale-105">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-amber text-black">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            Click through a live demo
          </span>
        </div>
      </div>
    </button>
  );
}

// Plain text trigger for the same fullscreen demo (used on phones, where the
// hero window is hidden to keep the first screen light).
export function PreviewLink({ className = "", onInk = false }: { className?: string; onInk?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => openPreview("site")}
      className={`inline-flex min-h-[48px] items-center gap-2 text-[15px] font-medium underline-offset-4 hover:underline ${onInk ? "text-white" : "text-ink"} ${className}`}
    >
      <span className="grid h-6 w-6 place-items-center rounded-full bg-amber text-ink">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      Or click through a live demo site
    </button>
  );
}
