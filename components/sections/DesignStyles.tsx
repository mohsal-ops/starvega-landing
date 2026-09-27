"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Chewy, Lobster, Saira_Stencil_One } from "next/font/google";

// "One system, many looks" — the design morph. One browser window stays pinned
// while you scroll; the restaurant inside it WIPES from design to design (a
// growing circle), each page scrolling itself as you go, while the section's
// background, ink and headline typeface become that design's own. Same demo
// restaurant, same sections, four completely different sites — the look
// changes, the system underneath (ordering, catering, loyalty, local search)
// never does. Screenshots are the real template in each theme, rendered with
// the fictional demo restaurant (public/designs/*). Keep in sync with
// burnin-bird/src/lib/themes/registry.ts.

const chewy = Chewy({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-ds-chewy" });
const lobster = Lobster({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-ds-lobster" });
const stencil = Saira_Stencil_One({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-ds-stencil" });
const FONT_VARS = `${chewy.variable} ${lobster.variable} ${stencil.variable}`;

type Design = {
  slug: string;
  name: string;
  vibe: string;
  bg: string;
  ink: string;
  soft: string;
  accent: string;
  font: string;
  upper?: boolean;
};

const DESIGNS: Design[] = [
  { slug: "classic-starvega", name: "Classic", vibe: "Clean and bright. Fits almost any kitchen.", bg: "#ffffff", ink: "#1d1d1d", soft: "#6b6b6b", accent: "#e8833a", font: "var(--font-inter), system-ui, sans-serif" },
  { slug: "smash-bold", name: "Smash & Bold", vibe: "Launch-drop energy: a 3D mascot, huge type, big product cards.", bg: "#eef1f0", ink: "#111315", soft: "#5a5f5c", accent: "#111315", font: "var(--font-ds-chewy), cursive", upper: true },
  { slug: "diner-classic", name: "Diner Classic", vibe: "Golden, retro, menu-first, with melting-cheese drips.", bg: "#fcb931", ink: "#3b2517", soft: "#5c3a22", accent: "#3b2517", font: "var(--font-ds-lobster), cursive" },
  { slug: "refined-elegant", name: "Refined", vibe: "Dark and editorial: full-screen photos, stencil headlines, slow parallax.", bg: "#0f0606", ink: "#ffffff", soft: "#b9b3b3", accent: "#ffd469", font: "var(--font-ds-stencil), sans-serif", upper: true },
];

const N = DESIGNS.length;

// One layer of the window: design i, revealed by a circle growing from the
// top-right as its scroll segment begins, its page auto-scrolling within.
function Layer({ d, i, progress }: { d: Design; i: number; progress: MotionValue<number> }) {
  const seg = 1 / N;
  const start = i * seg;
  const r = useTransform(progress, [Math.max(0, start - seg * 0.35), start], i === 0 ? ["160%", "160%"] : ["0%", "160%"]);
  const clip = useTransform(r, (v) => `circle(${v} at 88% 8%)`);
  const y = useTransform(progress, [start, Math.min(1, start + seg)], ["0%", "-62%"]);
  return (
    <motion.div className="absolute inset-0 overflow-hidden" style={{ clipPath: clip, zIndex: i + 1 }}>
      <motion.div className="relative w-full" style={{ y }}>
        <Image
          src={`/designs/${d.slug}.webp`}
          alt={`${d.name} design`}
          width={1100}
          height={3667}
          sizes="(max-width: 768px) 92vw, 60vw"
          className="h-auto w-full"
          priority={i === 0}
        />
      </motion.div>
    </motion.div>
  );
}

function BrowserBar({ d }: { d: Design }) {
  return (
    <div className="flex items-center gap-1.5 border-b border-black/10 bg-white/90 px-3 py-2 backdrop-blur">
      <span className="size-2.5 rounded-full bg-[#ff5f57]" />
      <span className="size-2.5 rounded-full bg-[#febc2e]" />
      <span className="size-2.5 rounded-full bg-[#28c840]" />
      <span className="ml-3 flex-1 truncate rounded-md bg-black/5 px-3 py-1 font-mono text-[11px] text-black/50">
        thecopperfork.com · {d.name.toLowerCase()} design
      </span>
    </div>
  );
}

function StaticFallback() {
  return (
    <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2">
      {DESIGNS.map((d) => (
        <figure key={d.slug} className="overflow-hidden rounded-2xl border border-line bg-white">
          <BrowserBar d={d} />
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image src={`/designs/${d.slug}-top.webp`} alt={`${d.name} design`} fill sizes="(max-width: 640px) 92vw, 45vw" className="object-cover object-top" />
          </div>
          <figcaption className="p-4">
            <p className="text-sm font-semibold text-ink">{d.name}</p>
            <p className="mt-1 text-sm text-ink-soft">{d.vibe}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export default function DesignStyles() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(N - 1, Math.max(0, Math.floor(v * N + 0.12)));
    if (i !== active) setActive(i);
  });
  const d = DESIGNS[active];
  const frameScale = useTransform(scrollYProgress, [0, 0.06], [0.92, 1]);
  const frameTilt = useTransform(scrollYProgress, [0, 0.06], [8, 0]);

  if (reduce) {
    return (
      <section id="design-styles" className="bg-bg px-6 py-24 text-ink sm:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-amber">One system, many looks</p>
          <h2 className="text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1.05]">Pick the look. Keep the system.</h2>
        </div>
        <StaticFallback />
      </section>
    );
  }

  return (
    <section id="design-styles" ref={ref} className={`relative ${FONT_VARS}`} style={{ height: `${N * 110}vh` }}>
      <motion.div
        className="sticky top-0 flex h-svh flex-col overflow-hidden"
        animate={{ backgroundColor: d.bg, color: d.ink }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* prime every design font up front so each headline swaps in already loaded */}
        <span aria-hidden className="pointer-events-none absolute -left-[9999px] top-0 opacity-0">
          {DESIGNS.map((x) => <span key={x.slug} style={{ fontFamily: x.font }}>Aa</span>)}
        </span>
        <div className="mx-auto grid h-full w-full max-w-7xl grid-rows-[auto_1fr] gap-6 px-5 pb-6 pt-24 sm:px-10 md:grid-cols-[0.8fr_1.2fr] md:grid-rows-1 md:items-center md:gap-12 md:pb-10 md:pt-20">
          {/* words */}
          <div className="relative">
            <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] md:mb-5 md:text-xs" style={{ color: d.accent === d.ink ? d.soft : d.accent }}>
              <span className="inline-block size-1.5 rounded-full" style={{ backgroundColor: d.accent === d.ink ? d.soft : d.accent }} />
              One system, many looks
            </p>
            <div className="relative h-[clamp(3.4rem,11vw,6.6rem)] md:h-[clamp(4.5rem,8vw,7.5rem)]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.h2
                  key={d.slug}
                  className="absolute inset-x-0 top-0 whitespace-nowrap text-[clamp(2.4rem,10vw,4.6rem)] leading-[1.05] md:text-[clamp(2.6rem,4.4vw,5rem)]"
                  style={{ fontFamily: d.font, textTransform: d.upper ? "uppercase" : "none", fontWeight: d.slug === "classic-starvega" ? 600 : 400, letterSpacing: d.slug === "classic-starvega" ? "-0.03em" : "0" }}
                  initial={{ y: "60%", opacity: 0, filter: "blur(10px)" }}
                  animate={{ y: "0%", opacity: 1, filter: "blur(0px)", rotate: d.slug === "diner-classic" ? -3 : d.slug === "smash-bold" ? -2 : 0 }}
                  exit={{ y: "-50%", opacity: 0, filter: "blur(10px)" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  {d.name}
                </motion.h2>
              </AnimatePresence>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={d.slug}
                className="mt-2 max-w-sm text-[15px] leading-relaxed md:mt-4 md:text-lg"
                style={{ color: d.soft }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
              >
                {d.vibe}
              </motion.p>
            </AnimatePresence>

            {/* progress rail */}
            <ol className="mt-5 hidden gap-2 md:mt-10 md:grid">
              {DESIGNS.map((x, i) => (
                <li key={x.slug} className="flex items-center gap-3 text-sm">
                  <span className="relative h-px w-10 overflow-hidden" style={{ backgroundColor: `${d.ink}33` }}>
                    <motion.span className="absolute inset-0 origin-left" style={{ backgroundColor: d.ink }} animate={{ scaleX: i <= active ? 1 : 0 }} transition={{ duration: 0.5 }} />
                  </span>
                  <span className="transition-opacity duration-500" style={{ opacity: i === active ? 1 : 0.45 }}>{x.name}</span>
                </li>
              ))}
            </ol>
            <p className="mt-10 hidden max-w-sm text-sm leading-relaxed md:block" style={{ color: d.soft }}>
              <span className="font-semibold" style={{ color: d.ink }}>Same product, every style:</span> commission-free ordering,
              catering, loyalty and local search don&apos;t change with the design. The look is yours to choose.
            </p>
          </div>

          {/* the window */}
          <motion.div className="relative min-h-0 [perspective:1400px]" style={{ scale: frameScale }}>
            <motion.div
              className="relative flex h-full max-h-[70svh] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_40px_80px_-30px_rgba(0,0,0,0.45)] ring-1 ring-black/10 md:aspect-[16/11] md:h-auto md:max-h-none"
              style={{ rotateX: frameTilt }}
            >
              <BrowserBar d={d} />
              <div className="relative min-h-[46svh] flex-1 bg-white md:min-h-0">
                {DESIGNS.map((x, i) => (
                  <Layer key={x.slug} d={x} i={i} progress={scrollYProgress} />
                ))}
              </div>
            </motion.div>
            {/* mobile step dots */}
            <div className="mt-4 flex justify-center gap-2 md:hidden">
              {DESIGNS.map((x, i) => (
                <span key={x.slug} className="h-1.5 rounded-full transition-all duration-500" style={{ width: i === active ? 24 : 6, backgroundColor: i === active ? d.ink : `${d.ink}40` }} />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
