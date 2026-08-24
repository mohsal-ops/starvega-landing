"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/track-client";

// Fires one "pageview" per load and one "section_view" per funnel section per
// session, the first time each section crosses 50% viewport visibility.
// DOM id → canonical sectionId (the page's 7th section is id="faq" = "objections").
const SECTIONS: [domId: string, sectionId: string][] = [
  ["hook", "hook"],
  ["agitate", "agitate"],
  ["turn", "turn"],
  ["proof", "proof"],
  ["offer", "offer"],
  ["faq", "objections"],
  ["cta", "cta"],
];
const FIRED_KEY = "sv_sections_fired";

export default function Tracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname?.startsWith("/admin")) return; // don't count owner's admin visits
    track("pageview");

    let fired = new Set<string>();
    try {
      fired = new Set(JSON.parse(sessionStorage.getItem(FIRED_KEY) || "[]"));
    } catch {
      /* ignore */
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || e.intersectionRatio < 0.5) continue;
          const match = SECTIONS.find(([domId]) => domId === e.target.id);
          if (!match) continue;
          const sectionId = match[1];
          if (fired.has(sectionId)) {
            io.unobserve(e.target);
            continue;
          }
          fired.add(sectionId);
          try {
            sessionStorage.setItem(FIRED_KEY, JSON.stringify([...fired]));
          } catch {
            /* ignore */
          }
          track("section_view", { sectionId });
          io.unobserve(e.target);
        }
      },
      { threshold: 0.5 },
    );

    for (const [domId] of SECTIONS) {
      const el = document.getElementById(domId);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
