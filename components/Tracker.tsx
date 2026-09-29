"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/track-client";

// Fires one "pageview" per load and one "section_view" per funnel section per
// session. A section counts as seen once half of it is on screen OR it fills half
// the viewport - tall sections (the offer on a phone) can never be 50% visible,
// which used to make them look skipped.
const SECTIONS: [domId: string, sectionId: string][] = [
  ["hook", "hook"],
  ["problem", "problem"],
  ["proof", "proof"],
  ["offer", "offer"],
  ["signup", "signup"],
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
          const seen = e.intersectionRatio >= 0.5 || e.intersectionRect.height >= window.innerHeight * 0.5;
          if (!e.isIntersecting || !seen) continue;
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
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1] },
    );

    for (const [domId] of SECTIONS) {
      const el = document.getElementById(domId);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
