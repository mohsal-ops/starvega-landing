"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { openPackModal } from "@/lib/pack-modal";
import { track } from "@/lib/track-client";
import { openContactMenu } from "@/lib/contact";

// The live demo (starvega-demo) shown two ways:
//  1) An inline window that is ONE big click target ("see how your site would
//     look") - tilts in 3D toward the cursor, glows with the brand iridescence,
//     autoplays a looping tour. A small secondary chip opens the owner dashboard.
//  2) A persistent floating "Preview" button opening the real demo FULLSCREEN
//     with a glassy control bar (sliding toggle) and, on phones, a clean bottom
//     action bar so the CTAs never cram.
const DEMO_URL = (process.env.NEXT_PUBLIC_DEMO_URL || "https://starvega-demo.vercel.app").replace(/\/$/, "");
const SITE_SRC = `${DEMO_URL}/`;
const DASHBOARD_SRC = `${DEMO_URL}/admin`;

export function PreviewEmbed() {
  const reduce = useReducedMotion();
  const [fullscreen, setFullscreen] = useState(false);
  const [view, setView] = useState<"site" | "dashboard">("site");
  const [frameLoaded, setFrameLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const rxRaw = useMotionValue(0);
  const ryRaw = useMotionValue(0);
  const rotateX = useSpring(rxRaw, { stiffness: 140, damping: 18 });
  const rotateY = useSpring(ryRaw, { stiffness: 140, damping: 18 });
  const onTilt = (e: React.MouseEvent) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    ryRaw.set(((e.clientX - r.left) / r.width - 0.5) * 6);
    rxRaw.set(-((e.clientY - r.top) / r.height - 0.5) * 6);
  };
  const resetTilt = () => {
    rxRaw.set(0);
    ryRaw.set(0);
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const p = v.play();
            if (p && typeof p.catch === "function") p.catch(() => {});
          } else v.pause();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const open = useCallback((initial: "site" | "dashboard" = "site") => {
    setView(initial);
    setFullscreen(true);
    track("preview_opened", { sectionId: initial });
  }, []);
  const close = useCallback(() => setFullscreen(false), []);
  const showDashboard = () => {
    setView("dashboard");
    track("preview_dashboard_opened");
  };

  useEffect(() => setFrameLoaded(false), [view, fullscreen]);

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
      {/* ── Inline preview window (one big click target) ──────────────────── */}
      <section id="live-preview" className="scroll-mt-20 bg-paper px-6 py-24 sm:px-10 sm:py-32">
        <div className="mx-auto w-full max-w-5xl">
          <p className="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-amber">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-amber opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber" />
            </span>
            See it live
          </p>
          <h2 className="max-w-3xl text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-ink">
            A real, working site. Not a screenshot.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
            A full demo restaurant running on the exact platform you get. Tap it to click through the
            menu, ordering, catering, even the owner dashboard.
          </p>

          <div className="group relative mx-auto mt-12 [perspective:1400px]">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 -z-10 rounded-[36px] opacity-30 blur-3xl transition-opacity duration-700 group-hover:opacity-60 sm:-inset-10"
              style={{ backgroundImage: "var(--gradient-sphere)" }}
            />

            {/* the window itself is the click target (role=button; a real <button>
                can't wrap the inner dashboard <button>). */}
            <motion.div
              role="button"
              tabIndex={0}
              aria-label="Open the live preview of your site"
              onClick={() => open("site")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  open("site");
                }
              }}
              onMouseMove={onTilt}
              onMouseLeave={resetTilt}
              style={{ rotateX, rotateY, transformPerspective: 1400 }}
              initial={reduce ? undefined : { opacity: 0, y: 40 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ type: "spring", stiffness: 90, damping: 18 }}
              className="relative cursor-pointer overflow-hidden rounded-[14px] border border-ash bg-surface shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)] transition-shadow hover:shadow-[0_40px_100px_-28px_rgba(0,0,0,0.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
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
                  className="absolute inset-0 h-full w-full scale-[1.13] object-cover object-[center_72%]"
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

                <div className="pointer-events-none absolute inset-0 bg-black/25 transition-colors duration-300 group-hover:bg-black/10" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/50 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />

                {/* Live badge */}
                <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                  <span className="relative inline-flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-amber opacity-75 motion-safe:animate-ping" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber" />
                  </span>
                  Live
                </div>

                {/* The one screaming CTA, centered. Purely visual (window handles click). */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <motion.span
                    animate={reduce ? undefined : { scale: [1, 1.04, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-flex items-center gap-2.5 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black shadow-2xl ring-4 ring-white/25 transition-transform group-hover:scale-105 sm:text-base"
                  >
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-amber text-black">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M8 5v14l11-7z" /></svg>
                    </span>
                    See how your site would look
                  </motion.span>
                </div>

                {/* Secondary: owner dashboard (stops the window click). */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    open("dashboard");
                  }}
                  className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/40 bg-black/40 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                >
                  or peek at the owner dashboard
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Floating "Preview" button ─────────────────────────────────────── */}
      {!fullscreen && (
        <motion.button
          type="button"
          onClick={() => open("site")}
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 30, delay: reduce ? 0 : 1.2 }}
          whileHover={reduce ? undefined : { scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="fixed bottom-5 right-5 z-[190] inline-flex min-h-[48px] items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white shadow-xl ring-1 ring-white/10"
          aria-label="Open the live preview"
        >
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-amber opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber" />
          </span>
          Preview
        </motion.button>
      )}

      {/* ── Fullscreen overlay ────────────────────────────────────────────── */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[280] flex flex-col bg-ink"
          >
            {/* glassy control bar */}
            <motion.div
              initial={reduce ? undefined : { y: -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="relative shrink-0 border-b border-white/10 bg-gradient-to-b from-black/95 to-black/70 px-3 py-2.5 backdrop-blur-xl sm:px-4"
            >
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber/70 to-transparent" />
              <div className="flex items-center justify-between gap-3">
                {/* sliding toggle */}
                <div className="relative flex items-center rounded-full border border-white/15 bg-white/5 p-1">
                  {(["site", "dashboard"] as const).map((k) => {
                    const active = view === k;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => (k === "site" ? setView("site") : showDashboard())}
                        className="relative z-10 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:px-3.5"
                      >
                        {active && (
                          <motion.span
                            layoutId="pvToggle"
                            className="absolute inset-0 -z-10 rounded-full bg-white"
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          />
                        )}
                        <span className={active ? "text-black" : "text-white/60 hover:text-white"}>
                          {k === "site" ? "Website" : "Dashboard"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/50 lg:flex">
                  <span className="relative inline-flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-amber opacity-75 motion-safe:animate-ping" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber" />
                  </span>
                  Live demo · sample content
                </p>

                <div className="flex items-center gap-2">
                  {/* desktop: inline CTAs. mobile: they live in the bottom bar. */}
                  <button
                    type="button"
                    onClick={openContactMenu}
                    className="hidden min-h-[40px] items-center justify-center rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:inline-flex"
                  >
                    Message me
                  </button>
                  <button
                    type="button"
                    onClick={openPackModal}
                    className="hidden min-h-[40px] items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-all hover:shadow-[0_0_22px_-4px_rgba(240,144,74,0.7)] active:scale-[0.99] sm:inline-flex"
                  >
                    Choose your plan
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close preview"
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/5 text-white transition-colors hover:bg-white/15"
                  >
                    <span aria-hidden className="text-xl leading-none">&times;</span>
                  </button>
                </div>
              </div>
            </motion.div>

            <div className="relative flex-1 bg-bg">
              <iframe
                key={view}
                src={view === "site" ? SITE_SRC : DASHBOARD_SRC}
                title={view === "site" ? "Live demo restaurant site" : "Read-only owner dashboard"}
                onLoad={() => setFrameLoaded(true)}
                className="h-full w-full bg-bg"
              />
              <div
                aria-hidden={frameLoaded}
                className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 bg-bg transition-opacity duration-500 ${
                  frameLoaded ? "opacity-0" : "opacity-100"
                }`}
              >
                <span className="relative grid h-14 w-14 place-items-center">
                  <span className="absolute inset-0 rounded-full" style={{ backgroundImage: "var(--gradient-sphere)", opacity: 0.25, filter: "blur(8px)" }} />
                  <span className="h-9 w-9 animate-spin rounded-full border-2 border-ash border-t-amber" />
                </span>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
                  {view === "site" ? "Loading the live demo…" : "Loading the owner dashboard…"}
                </p>
              </div>
            </div>

            {/* mobile action bar: the two CTAs, thumb-friendly, never cramped */}
            <div className="flex shrink-0 items-center gap-2 border-t border-white/10 bg-black/90 p-3 backdrop-blur-xl sm:hidden">
              <button
                type="button"
                onClick={openContactMenu}
                className="min-h-[48px] flex-1 rounded-xl border border-white/25 text-sm font-semibold text-white transition-colors active:bg-white/10"
              >
                Message me
              </button>
              <button
                type="button"
                onClick={openPackModal}
                className="min-h-[48px] flex-[1.3] rounded-xl bg-white text-sm font-semibold text-black transition-transform active:scale-[0.99]"
              >
                Choose your plan
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
