"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

// The OFF+BRAND motion layer. Renders nothing — it scans the DOM for data-hooks
// and wires the reveals/parallax onto the existing funnel sections, so copy and
// CTAs stay exactly where they are. Everything is a fromTo tween (the resting
// hidden state lives in CSS as a FOUC guard; fromTo overrides it to animate in).
//
// Hooks:
//   data-reveal-chars  → headline: SplitText lines/words/chars, chars rise from a
//                        line mask with a fast cascade
//   data-reveal-words  → sub-copy: SplitText words rise, gentler stagger
//   data-reveal        → block: y/opacity fade-up
//   data-reveal-stagger→ container: its direct children fade up in sequence
//   data-parallax      → scrubbed vertical drift tied to the element's scroll
//   data-price-anchor  → reveal [data-price-old] first, then [data-price-new]
//   data-reveal-now    → play immediately on load (no scroll gate) — used above
//                        the fold so the hero animates the moment the page opens
export default function MotionLayer() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // CSS reveals everything under html.reduce; skip all motion.
      document.documentElement.classList.add("reduce");
      return;
    }

    let ctx: ReturnType<typeof gsap.context> | undefined;
    const splits: SplitText[] = [];
    let cancelled = false;

    const build = () => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        const EASE = "power3.out";

        // 1 — Headlines: per-character reveal out of a per-line mask.
        gsap.utils.toArray<HTMLElement>("[data-reveal-chars]").forEach((el) => {
          const split = new SplitText(el, { type: "lines,words,chars", linesClass: "line" });
          splits.push(split);
          gsap.set(el, { visibility: "visible" });
          const now = el.hasAttribute("data-reveal-now");
          gsap.fromTo(
            split.chars,
            { yPercent: 110, rotateZ: 6, opacity: 0 },
            {
              yPercent: 0,
              rotateZ: 0,
              opacity: 1,
              duration: 0.9,
              ease: "power4.out",
              stagger: 0.012,
              ...(now
                ? { delay: 0.08 }
                : { scrollTrigger: { trigger: el, start: "top 85%", once: true } }),
            },
          );
        });

        // 2 — Sub-copy: words rise, no rotation, softer stagger.
        gsap.utils.toArray<HTMLElement>("[data-reveal-words]").forEach((el) => {
          const split = new SplitText(el, { type: "lines,words", linesClass: "line" });
          splits.push(split);
          gsap.set(el, { opacity: 1 });
          const now = el.hasAttribute("data-reveal-now");
          gsap.fromTo(
            split.words,
            { yPercent: 110, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.8,
              ease: EASE,
              stagger: 0.03,
              ...(now
                ? { delay: 0.16 }
                : { scrollTrigger: { trigger: el, start: "top 88%", once: true } }),
            },
          );
        });

        // 3 — Blocks: fade-up. data-reveal-now plays on load in a small ladder.
        let nowIndex = 0;
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          const now = el.hasAttribute("data-reveal-now");
          gsap.fromTo(
            el,
            { y: 60, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              ease: EASE,
              ...(now
                ? { delay: 0.12 + nowIndex++ * 0.08 }
                : { scrollTrigger: { trigger: el, start: "top 88%", once: true } }),
            },
          );
        });

        // 4 — Staggered containers: direct children in sequence.
        gsap.utils.toArray<HTMLElement>("[data-reveal-stagger]").forEach((el) => {
          gsap.fromTo(
            Array.from(el.children),
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: EASE,
              stagger: 0.08,
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            },
          );
        });

        // 5 — Parallax: scrubbed drift across the element's own scroll span.
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: -8 },
            {
              yPercent: 8,
              ease: "none",
              scrollTrigger: {
                trigger: el.parentElement ?? el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        });

        // 6 — Price anchor: old price lands first, then the new price arrives.
        gsap.utils.toArray<HTMLElement>("[data-price-anchor]").forEach((el) => {
          const oldP = el.querySelector<HTMLElement>("[data-price-old]");
          const newP = el.querySelector<HTMLElement>("[data-price-new]");
          const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 85%", once: true } });
          if (oldP) tl.fromTo(oldP, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: EASE });
          if (newP)
            tl.fromTo(
              newP,
              { opacity: 0, y: 24, scale: 0.96 },
              { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power4.out" },
              "+=0.35",
            );
        });
      });

      // Layout may have shifted (split text, late fonts) — recompute triggers.
      ScrollTrigger.refresh();
    };

    // SplitText needs final font metrics, or lines split wrong.
    if (document.fonts?.ready) document.fonts.ready.then(build);
    else build();

    return () => {
      cancelled = true;
      splits.forEach((s) => s.revert());
      ctx?.revert();
    };
  }, []);

  return null;
}
