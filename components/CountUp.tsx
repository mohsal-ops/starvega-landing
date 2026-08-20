"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "motion/react";

// A number that counts up from 0 when it scrolls into view — the GSAP count-up
// treatment the funnel spec calls for on the big commission/proof figures.
//
// Trigger is an IntersectionObserver (reliable, independent of the smooth-scroll
// loop); the animation itself is a GSAP tween. Reduced-motion visitors get the
// final value immediately with no animation.
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1.7,
  className,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fmt = (n: number) => prefix + Math.round(n).toLocaleString("en-US") + suffix;

    if (reduce) {
      el.textContent = fmt(to);
      return;
    }

    el.textContent = fmt(0);
    let tween: gsap.core.Tween | null = null;
    const obj = { v: 0 };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            io.disconnect();
            tween = gsap.to(obj, {
              v: to,
              duration,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = fmt(obj.v);
              },
            });
          }
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      tween?.kill();
    };
  }, [to, prefix, suffix, duration, reduce]);

  // SSR / no-JS / crawler fallback shows the real final number.
  return (
    <span ref={ref} className={className}>
      {prefix + to.toLocaleString("en-US") + suffix}
    </span>
  );
}
