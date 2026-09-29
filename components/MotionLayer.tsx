"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// The reveal layer: fades [data-reveal] blocks (and the children of
// [data-reveal-stagger]) up as they scroll into view. All motion is CSS
// (globals.css); this only adds html.motion once and flips .is-in - no animation
// library, so it costs next to nothing on a phone. /learn and /admin opt out.
const SKIP = (p: string | null) => !!p && (p.startsWith("/learn") || p.startsWith("/admin"));

export default function MotionLayer() {
  const pathname = usePathname();
  useEffect(() => {
    if (SKIP(pathname)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-stagger]"));
    // Anything already on screen (or scrolled past) stays visible - never hide
    // content the visitor is looking at.
    const vh = window.innerHeight;
    const pending = targets.filter((el) => el.getBoundingClientRect().top > vh * 0.9);
    for (const el of targets) if (!pending.includes(el)) el.classList.add("is-in");
    for (const el of pending) {
      if (el.hasAttribute("data-reveal-stagger")) {
        Array.from(el.children).forEach((c, i) => (c as HTMLElement).style.setProperty("--i", String(i)));
      }
    }
    document.documentElement.classList.add("motion");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    pending.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
