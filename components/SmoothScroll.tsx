"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { registerLenis } from "@/lib/widget-cta";

// Site-wide inertia scroll (Lenis), driven by GSAP's ticker — the standard
// pairing for a single rAF loop. Renders nothing; just installs the scroll loop.
//
// Guardrail: visitors with prefers-reduced-motion get native scrolling and no
// Lenis at all. All scroll-in animations (Motion reveals, GSAP count-ups) also
// check the same flag and fall back to static.
export default function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    // Expose it so the widget entry points can smooth-scroll to #cta.
    registerLenis(lenis);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      registerLenis(null);
    };
  }, []);

  return null;
}
