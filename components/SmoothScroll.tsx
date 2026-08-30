"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerLenis } from "@/lib/widget-cta";

gsap.registerPlugin(ScrollTrigger);

// Site-wide inertia scroll (Lenis), driven by GSAP's ticker - the standard
// pairing for a single rAF loop. Renders nothing; just installs the scroll loop.
//
// Guardrail: visitors with prefers-reduced-motion get native scrolling and no
// Lenis at all. All scroll-in animations (Motion reveals, GSAP count-ups) also
// check the same flag and fall back to static.
export default function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    // OFF+BRAND feel: weighty momentum, everything eases, no hard jumps.
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    // Expose it so the widget entry points can smooth-scroll to #cta.
    registerLenis(lenis);

    // Keep ScrollTrigger in lockstep with Lenis so scroll-driven reveals/parallax
    // read the correct scroll position, and drive both from GSAP's single ticker.
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
      registerLenis(null);
    };
  }, []);

  return null;
}
