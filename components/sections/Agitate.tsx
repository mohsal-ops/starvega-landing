"use client";

import { CountUp } from "@/components/CountUp";
import { Reveal } from "@/components/Reveal";

// SECTION 2 — AGITATE. Job: make the cost of doing nothing concrete and
// uncomfortable. Real commission ranges, presented as a few big scannable
// numbers a tired owner can absorb in five seconds. NO solution here (that's
// THE TURN). Inverted to near-black so the cost lands with weight.
//
// Honesty: the premise ($5-6k/mo in orders) is stated as a conditional example,
// and 15-30% is DoorDash's real published commission range — nothing invented.

const STATS = [
  {
    qualifier: "up to",
    to: 30,
    suffix: "%",
    label: "commission on every single order. DoorDash charges 15-30%.",
  },
  {
    qualifier: "up to",
    to: 1800,
    prefix: "$",
    unit: "/mo",
    label: "gone to commission every month — roughly $1,000 to $1,800.",
  },
  {
    qualifier: "up to",
    to: 20000,
    prefix: "$",
    unit: "/yr",
    label: "a year of revenue you already earned — $12,000 to $20,000.",
  },
  {
    qualifier: "and another",
    to: 500,
    prefix: "$",
    unit: "/mo",
    label: "on top, for a Toast or Square style setup. $150 to $500 every month.",
  },
];

export default function Agitate() {
  return (
    <section id="agitate" className="bg-ink px-6 py-24 text-bg sm:px-10 sm:py-32">
      <div className="mx-auto w-full max-w-5xl">
        <Reveal>
          <p className="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-amber">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
            The math nobody shows you
          </p>
          <h2 className="max-w-3xl text-[clamp(1.9rem,5.5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.02em]">
            Say you do $5,000-6,000 a month in delivery orders. Here is where it
            actually goes.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-x-10 gap-y-12 sm:mt-20 sm:grid-cols-2">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06}>
              <div className="border-t border-white/15 pt-5">
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/50">
                  {s.qualifier}
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <CountUp
                    to={s.to}
                    prefix={s.prefix ?? ""}
                    suffix={s.suffix ?? ""}
                    className="text-[clamp(3rem,12vw,5.5rem)] font-semibold leading-none tracking-[-0.03em] text-amber tabular-nums"
                  />
                  {s.unit && (
                    <span className="text-xl font-medium text-white/40">{s.unit}</span>
                  )}
                </div>
                <p className="mt-3 max-w-sm text-base leading-relaxed text-white/70">
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-16 max-w-2xl text-[clamp(1.25rem,3.5vw,1.9rem)] font-medium leading-snug tracking-[-0.01em] sm:mt-24">
            That is money you already earned, walking out the door every month.
            That is the real cost of doing nothing.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
