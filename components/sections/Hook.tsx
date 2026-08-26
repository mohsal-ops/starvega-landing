"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowLink } from "@/components/ArrowLink";

// SECTION 1 — HERO / HOOK. OFF+BRAND-adapted on a white canvas: a typographic
// architecture where monumental all-caps Inter carries the message, and the one
// iridescent gradient sphere is the sole chromatic event (it, not the type, gets
// the ambient motion). The headline runs its SplitText character reveal on load
// (data-reveal-now), so the message assembles itself the instant the page opens.
// Strict monochrome otherwise; amber is reserved for real CTAs elsewhere.
export default function Hook() {
  const reduce = useReducedMotion();

  return (
    <section
      id="hook"
      className="relative flex min-h-svh flex-col justify-center overflow-hidden bg-bg px-6 pb-16 pt-28 sm:px-10"
    >
      {/* Concentric rings (parallax), the iridescent sphere, and faint grain. */}
      <HeroBackdrop reduce={!!reduce} />

      <div className="relative mx-auto w-full max-w-6xl">
        <p
          data-reveal
          data-reveal-now
          className="mb-8 text-[11px] font-normal uppercase tracking-[0.22em] text-ink"
        >
          For restaurant owners
        </p>

        <h1
          data-reveal-chars
          data-reveal-now
          className="font-display text-[clamp(2.9rem,10.5vw,7.5rem)] font-normal uppercase leading-[0.82] tracking-[0.005em] text-ink"
        >
          <span className="block">Still paying</span>
          <span className="block">DoorDash 15–30%</span>
          <span className="block">on every order?</span>
        </h1>

        <p
          data-reveal-words
          data-reveal-now
          className="mt-8 max-w-[46ch] text-[18px] font-normal leading-[1.4] text-ink-soft"
        >
          On every single order. Month after month. It is quietly the most
          expensive line item you never signed off on.
        </p>

        <div data-reveal data-reveal-now className="mt-8">
          <ArrowLink href="#agitate" className="text-[15px] text-ink">
            See what it&apos;s costing you
          </ArrowLink>
        </div>
      </div>

      {/* Editorial scroll indicator, bottom-right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduce ? 0 : 0.6, duration: 0.5 }}
        className="pointer-events-none absolute bottom-[30px] right-[30px] hidden items-center gap-2 text-[11px] font-normal uppercase tracking-[0.2em] text-ink sm:flex"
      >
        Scroll
        <motion.span
          aria-hidden
          animate={reduce ? undefined : { y: [0, 4, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          ↓
        </motion.span>
      </motion.div>
    </section>
  );
}

// The single chromatic moment. A large iridescent sphere sits right-of-center,
// partly behind the headline, drifting and slowly turning so the gradient reads
// as alive. Thin ash concentric rings (parallaxed on scroll) anchor it into an
// editorial composition. All decorative and static under reduced-motion.
function HeroBackdrop({ reduce }: { reduce: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* concentric rings, anchored to the sphere's focal point (right-of-center) */}
      <div data-parallax className="absolute right-[12%] top-1/2 -translate-y-1/2">
        {[560, 820, 1120].map((d) => (
          <div
            key={d}
            className="absolute rounded-full border border-ash/60"
            style={{ width: d, height: d, left: -d / 2, top: -d / 2 }}
          />
        ))}
      </div>

      {/* soft glow behind the sphere */}
      <motion.div
        className="absolute right-[6%] top-1/2 h-[52vh] w-[52vh] rounded-full blur-3xl"
        style={{ backgroundImage: "var(--gradient-sphere)", opacity: 0.35 }}
        initial={{ y: "-50%" }}
        animate={reduce ? { y: "-50%" } : { y: "-50%", scale: [1, 1.06, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* the sphere itself — slow float + slow turn so the iridescence shifts */}
      <motion.div
        className="absolute right-[6%] top-1/2 h-[52vh] w-[52vh] rounded-full"
        style={{ backgroundImage: "var(--gradient-sphere)" }}
        initial={{ y: "-50%" }}
        animate={reduce ? { y: "-50%" } : { rotate: 360, y: ["-50%", "-54%", "-50%"] }}
        transition={{
          rotate: { duration: 44, repeat: Infinity, ease: "linear" },
          y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* faint film grain over the whole hero */}
      {!reduce && <div className="grain" />}
    </div>
  );
}
