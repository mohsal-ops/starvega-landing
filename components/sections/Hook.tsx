"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

// SECTION 1 — HOOK. Its only job: name the exact pain a restaurant owner already
// feels, in the very first thing they see, no scroll needed. No solution, no
// numbers yet (that's AGITATE). Text is the whole message — pure type, no image.
export default function Hook() {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: reduce ? 0 : 0.05 } },
  };
  const rise: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section
      id="hook"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 sm:px-10"
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto w-full max-w-5xl"
      >
        <h1 className="text-[clamp(2.4rem,8.5vw,5.5rem)] font-semibold leading-[1.03] tracking-[-0.02em]">
          <motion.span variants={rise} className="block">
            Still paying DoorDash
          </motion.span>
          <motion.span variants={rise} className="block">
            <span className="text-amber">15-30%</span> on every order?
          </motion.span>
        </h1>

        <motion.p
          variants={rise}
          className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl"
        >
          On every single order. Month after month. It is quietly the most
          expensive line item you never signed off on.
        </motion.p>
      </motion.div>

      <motion.a
        href="#agitate"
        aria-label="See what it's costing you"
        variants={rise}
        initial="hidden"
        animate="show"
        transition={{ delay: reduce ? 0 : 0.6 }}
        className="absolute inset-x-0 bottom-7 mx-auto flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
      >
        See what it&apos;s costing you
        <motion.span
          aria-hidden
          animate={reduce ? undefined : { y: [0, 5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          ↓
        </motion.span>
      </motion.a>
    </section>
  );
}
