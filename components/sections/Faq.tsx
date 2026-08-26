"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FAQS } from "@/lib/faq";
import { track } from "@/lib/track";

// SECTION 6 — OBJECTION HANDLING. Job: remove the last hesitation before the
// click, not add new information. Simple accordion so it stays short on mobile.
// Each open fires a GA event so we can see which doubts people actually have.
export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  const reduce = useReducedMotion();

  const toggle = (i: number) => {
    const next = open === i ? null : i;
    setOpen(next);
    if (next === i) track("faq_open", { question: FAQS[i].q });
  };

  return (
    <section id="faq" className="border-t border-line bg-bg px-6 py-24 sm:px-10 sm:py-32">
      <div className="mx-auto w-full max-w-3xl">
        <div>
          <p
            data-reveal
            className="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-ink-soft"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
            Before you ask
          </p>
          <h2
            data-reveal-chars
            className="text-[clamp(2rem,6vw,3.25rem)] font-semibold leading-[1.06] tracking-[-0.02em]"
          >
            The honest answers.
          </h2>
        </div>

        <div className="mt-12 sm:mt-16">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="border-t border-line last:border-b">
                <h3>
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-button-${i}`}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="text-lg font-medium leading-snug tracking-tight">
                      {f.q}
                    </span>
                    <motion.span
                      aria-hidden
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: reduce ? 0 : 0.2 }}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-xl leading-none text-ink-soft"
                    >
                      +
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`faq-button-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reduce ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-6 text-base leading-relaxed text-ink-soft">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
