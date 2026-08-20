"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

// Funnel instrumentation: how far people get. Fires once per milestone.
//  - scroll_depth: 25 / 50 / 75 / 100 %
//  - section_view: did they actually reach proof / offer / cta, etc.
// FAQ opens and the CTA click are tracked in their own components.
const SECTIONS = ["hook", "agitate", "turn", "proof", "offer", "faq", "cta"];
const DEPTHS = [25, 50, 75, 100];

export default function ScrollTracker() {
  useEffect(() => {
    const firedDepth = new Set<number>();
    const firedSection = new Set<string>();

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const pct = (window.scrollY / scrollable) * 100;
      for (const d of DEPTHS) {
        if (pct >= d && !firedDepth.has(d)) {
          firedDepth.add(d);
          track("scroll_depth", { percent: d });
        }
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !firedSection.has(e.target.id)) {
            firedSection.add(e.target.id);
            track("section_view", { section: e.target.id });
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.4 },
    );

    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return null;
}
