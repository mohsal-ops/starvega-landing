"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

// Hero visual: a floating 3D deck of the four real site designs (the template
// rendered with the fictional demo restaurant). The deck tilts toward the
// cursor, and every few seconds the front site swings out and tucks in at the
// back, so the visitor sees "a real restaurant site, in any look" before they
// read a word. Static (no cycle, no tilt) under reduced motion.

const CARDS = [
  { slug: "classic-starvega", name: "Classic" },
  { slug: "smash-bold", name: "Smash & Bold" },
  { slug: "diner-classic", name: "Diner Classic" },
  { slug: "refined-elegant", name: "Refined" },
];

// Resting pose for deck position p (0 = front).
const pose = (p: number) => ({ x: p * -26, y: p * -30, z: p * -70, rotateZ: p * -1.5, opacity: 1 - p * 0.14 });

export function DesignDeck({ className = "", size = "lg" }: { className?: string; size?: "lg" | "sm" }) {
  const reduce = useReducedMotion();
  const [order, setOrder] = useState([0, 1, 2, 3]); // order[p] = card index at position p
  const [cycled, setCycled] = useState(false); // the back card is the one that just left the front

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => {
      setOrder((o) => [...o.slice(1), o[0]]);
      setCycled(true);
    }, 3200);
    return () => clearInterval(t);
  }, [reduce]);

  // cursor tilt
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rY = useSpring(useTransform(mx, [-1, 1], [-26, -8]), { stiffness: 80, damping: 18 });
  const rX = useSpring(useTransform(my, [-1, 1], [14, 2]), { stiffness: 80, damping: 18 });
  useEffect(() => {
    if (reduce) return;
    const on = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, [reduce, mx, my]);

  const front = CARDS[order[0]];
  const w = size === "lg" ? "w-[min(26vw,420px)]" : "w-[78vw] max-w-[360px]";

  return (
    <div className={`[perspective:1600px] ${className}`}>
      <motion.div
        className={`relative aspect-[16/10] ${w} [transform-style:preserve-3d]`}
        style={reduce ? { rotateY: -16, rotateX: 8 } : { rotateY: rY, rotateX: rX }}
        initial={reduce ? false : { opacity: 0, y: 40, rotateZ: 6 }}
        animate={{ opacity: 1, y: 0, rotateZ: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      >
        {CARDS.map((c, idx) => {
          const p = order.indexOf(idx);
          const isLeaving = cycled && p === CARDS.length - 1;
          const rest = pose(p);
          return (
            <motion.div
              key={c.slug}
              className="absolute inset-0 overflow-hidden rounded-xl bg-white shadow-[0_30px_60px_-20px_rgba(20,20,40,0.45)] ring-1 ring-black/10"
              style={{ zIndex: 10 - p, transformStyle: "preserve-3d" }}
              animate={
                isLeaving
                  ? { x: [0, 190, rest.x], y: [0, -40, rest.y], z: [0, 60, rest.z], rotateZ: [0, 8, rest.rotateZ], opacity: [1, 1, rest.opacity] }
                  : rest
              }
              transition={isLeaving ? { duration: 0.95, times: [0, 0.45, 1], ease: [0.65, 0, 0.35, 1] } : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-1 border-b border-black/10 bg-white px-2 py-1.5">
                <span className="size-1.5 rounded-full bg-[#ff5f57]" />
                <span className="size-1.5 rounded-full bg-[#febc2e]" />
                <span className="size-1.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="relative h-full w-full">
                <Image src={`/designs/${c.slug}-top.webp`} alt="" fill sizes="460px" className="object-cover object-top" priority={idx === 0} />
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      <p className="mt-6 flex items-center justify-center gap-2 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
        <span className="inline-block size-1.5 animate-pulse rounded-full bg-amber" />
        Your site ·{" "}
        <motion.span key={front.slug} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-ink">
          {front.name}
        </motion.span>{" "}
        design
      </p>
    </div>
  );
}
