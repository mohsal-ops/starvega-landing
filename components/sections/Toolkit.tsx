"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { featureStatus, type FeatureKey } from "@/lib/features";
import { savingsBreakdown, formatUsd } from "@/lib/pricing";

// "What you get": one compact, swipeable section instead of five long ones.
// Each slide = a live phone screen (real dishes from a live client site) + the
// one line on how it makes the owner money. (Loyalty has its own section.) Slides follow lib/features.ts:
// hidden features never show, "soon" ones carry an Early access badge.

// Real dishes from a live client site (Burnin' Bird), served from /public.
const DISH = { classic: "/toolkit/classic.webp", tenders: "/toolkit/tenders.webp" };

type Slide = {
  id: string;
  feature: FeatureKey;
  kicker: string;
  title: string;
  body: string;
  money: string;
  screen: () => React.ReactNode;
};

const s = savingsBreakdown();

const SLIDES: Slide[] = [
  {
    id: "ordering",
    feature: "online_ordering",
    kicker: "Commission-free ordering",
    title: "Keep the 30%.",
    body: "Customers order on your own site. You keep every dollar and every customer's details, instead of renting them from an app.",
    money: `At ${s.estimatedOrdersPerDay} orders a day, that's about ${formatUsd(s.monthlySavings)} a month you stop handing over.`,
    screen: () => <OrderScreen />,
  },
  {
    id: "app",
    feature: "installable_app",
    kicker: "Your app, no App Store",
    title: "Your restaurant on their home screen.",
    body: "Regulars add you to their phone in one tap. Your logo, your colors, a one-tap reorder. No download fees.",
    money: "Make reordering the easiest thing on their phone, and they reorder more often.",
    screen: () => <AppScreen />,
  },
  {
    id: "alerts",
    feature: "order_push",
    kicker: "Never miss an order",
    title: "Every order pings your phone.",
    body: "New order? Your phone buzzes and the kitchen screen rings until someone taps it. Nothing slips during a rush.",
    money: "One missed order a night is about $750 a month gone. Not anymore.",
    screen: () => <AlertScreen />,
  },
  {
    id: "pos",
    feature: "pos_square",
    kicker: "Square & Clover",
    title: "Orders land in your POS.",
    body: "Paid website orders go straight into Square or Clover and print in the kitchen. No retyping tickets.",
    money: "Less staff time, fewer mistakes, and one screen for everything.",
    screen: () => <PosScreen />,
  },
];

export default function Toolkit() {
  const slides = SLIDES.filter((x) => featureStatus(x.feature) !== "hidden");
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  // Follow the swipe: the slide whose center is nearest the track's center.
  const onScroll = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestD = Infinity;
    [...el.children].forEach((c, i) => {
      const n = c as HTMLElement;
      const d = Math.abs(n.offsetLeft + n.offsetWidth / 2 - mid);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setActive(best);
  }, []);

  const go = (i: number) => {
    const el = track.current;
    const n = el?.children[i] as HTMLElement | undefined;
    if (!el || !n) return;
    el.scrollTo({ left: n.offsetLeft - (el.clientWidth - n.offsetWidth) / 2, behavior: "smooth" });
  };

  useEffect(() => {
    const el = track.current;
    el?.addEventListener("scroll", onScroll, { passive: true });
    return () => el?.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return (
    <section id="toolkit" className="overflow-hidden bg-ink py-20 text-white sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/50">What you get</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-[18ch] font-display text-4xl font-semibold leading-[1.02] tracking-[-0.02em] sm:text-5xl">
            Everything that makes you money. Nothing that takes a cut.
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => go(Math.max(0, active - 1))}
              disabled={active === 0}
              className="grid h-12 w-12 place-items-center rounded-full border border-white/20 text-white transition hover:border-white/60 disabled:opacity-30"
            >
              <Arrow dir="left" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => go(Math.min(slides.length - 1, active + 1))}
              disabled={active === slides.length - 1}
              className="grid h-12 w-12 place-items-center rounded-full bg-amber text-ink transition hover:bg-[#f0904a] disabled:opacity-30"
            >
              <Arrow dir="right" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={track}
        className="toolkit-track mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:px-[max(1.25rem,calc((100vw-72rem)/2+1.25rem))]"
      >
        {slides.map((sl, i) => {
          const on = i === active;
          const soon = featureStatus(sl.feature) === "soon";
          return (
            <motion.article
              key={sl.id}
              onClick={() => !on && go(i)}
              animate={{ opacity: on ? 1 : 0.45, scale: on ? 1 : 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="flex w-[86vw] max-w-[920px] shrink-0 snap-center flex-col gap-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-10 md:flex-row md:items-center"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase tracking-[0.16em] text-amber">{sl.kicker}</span>
                  {soon && (
                    <span className="rounded-full border border-white/25 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/70">
                      Early access
                    </span>
                  )}
                </div>
                <h3 className="mt-3 font-display text-3xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-4xl">{sl.title}</h3>
                <p className="mt-4 max-w-[46ch] text-[17px] leading-[1.55] text-white/70">{sl.body}</p>
                <p className="mt-6 flex max-w-[46ch] items-start gap-3 rounded-2xl bg-gain-bright/[0.1] px-4 py-3 text-[15px] font-medium leading-snug text-gain-bright">
                  <span aria-hidden className="mt-0.5">↗</span>
                  {sl.money}
                </p>
              </div>
              <div className="mx-auto shrink-0">
                <Phone active={on}>{sl.screen()}</Phone>
              </div>
            </motion.article>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label="Slides">
        {slides.map((sl, i) => (
          <button
            key={sl.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={sl.kicker}
            onClick={() => go(i)}
            className="h-11 px-1"
          >
            <span className={`block h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-8 bg-amber" : "w-3 bg-white/25"}`} />
          </button>
        ))}
      </div>
      <p className="mx-auto mt-2 max-w-6xl px-5 text-xs text-white/40">
        Estimates use {s.estimatedOrdersPerDay} orders a day at {formatUsd(s.avgOrderValue)} and a {s.commissionPct}% app commission. Your numbers will differ.
      </p>
    </section>
  );
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      {dir === "left" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}

// ── Phone frame + screens ────────────────────────────────────────────────────
function Phone({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div className="relative h-[480px] w-[236px] rounded-[44px] bg-[#0b0b0b] p-[9px] shadow-[0_30px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/15">
      <div className="absolute left-1/2 top-[16px] z-20 h-[22px] w-[78px] -translate-x-1/2 rounded-full bg-black" />
      <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-[#120d0b] text-[#fbf4ee]">
        <AnimatePresence mode="wait">{active && <motion.div key="s" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{children}</motion.div>}</AnimatePresence>
      </div>
    </div>
  );
}

const pop = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, type: "spring" as const, stiffness: 300, damping: 24 },
});

function OrderScreen() {
  return (
    <div className="flex h-full flex-col px-4 pt-12">
      <motion.p {...pop(0.05)} className="text-[11px] font-semibold text-white/50">Your bag</motion.p>
      <motion.div {...pop(0.12)} className="mt-3 flex items-center gap-3">
        <img src={DISH.classic} alt="" className="h-12 w-12 rounded-xl object-cover" />
        <div className="flex-1 text-[12px] font-bold">Classic Nashville<br /><span className="font-semibold text-white/50">Hot · fries</span></div>
        <span className="text-[12px] font-bold">$16.48</span>
      </motion.div>
      <motion.div {...pop(0.2)} className="mt-3 flex items-center gap-3">
        <img src={DISH.tenders} alt="" className="h-12 w-12 rounded-xl object-cover" />
        <div className="flex-1 text-[12px] font-bold">3 Jumbo Tenders<br /><span className="font-semibold text-white/50">Mild</span></div>
        <span className="text-[12px] font-bold">$13.99</span>
      </motion.div>
      <motion.div {...pop(0.3)} className="mt-5 space-y-1.5 rounded-2xl bg-white/[0.06] p-3 text-[11.5px] font-semibold">
        <div className="flex justify-between text-white/70"><span>Subtotal</span><span>$30.47</span></div>
        <div className="flex justify-between text-[#ff6b6b] line-through decoration-2"><span>App commission (30%)</span><span>-$9.14</span></div>
        <div className="flex justify-between text-[#3ddc84]"><span>You keep</span><span>$30.47</span></div>
      </motion.div>
      <motion.div {...pop(0.42)} className="mt-auto mb-6 rounded-full bg-white py-3 text-center text-[13px] font-extrabold text-[#120d0b]">Pay $32.30</motion.div>
    </div>
  );
}

function AppScreen() {
  return (
    <div className="flex h-full flex-col px-4 pt-11">
      <motion.p {...pop(0.05)} className="text-[10.5px] font-semibold text-white/50">Good evening, Sam</motion.p>
      <motion.p {...pop(0.1)} className="text-[19px] font-extrabold leading-tight">Hungry for heat?</motion.p>
      <motion.div {...pop(0.18)} className="relative mt-3 h-[170px] overflow-hidden rounded-[20px] bg-[#ff5a1f] p-3">
        <span className="rounded-full bg-[#120d0b] px-2 py-0.5 text-[8px] font-extrabold tracking-wider text-[#ffb48f]">BEST SELLER</span>
        <p className="mt-1.5 w-[55%] text-[20px] font-extrabold leading-[0.95] text-[#1a0b05]">Classic Nashville</p>
        <motion.img
          src={DISH.classic}
          alt=""
          className="absolute -bottom-6 -right-6 h-[140px] w-[140px] rounded-full object-cover"
          initial={{ rotate: -12, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.25 }}
        />
        <span className="absolute bottom-3 left-3 rounded-full bg-[#120d0b] px-3 py-1.5 text-[10px] font-extrabold">Order · $12.99</span>
      </motion.div>
      <motion.div {...pop(0.3)} className="mt-3 flex items-center gap-2 rounded-2xl bg-white/[0.06] p-2">
        <img src={DISH.tenders} alt="" className="h-9 w-9 rounded-lg object-cover" />
        <span className="flex-1 text-[10.5px] font-bold">Your usual<br /><span className="text-white/50">3 Jumbo Tenders</span></span>
        <span className="rounded-full bg-[#ff7a3d] px-2.5 py-1 text-[9.5px] font-extrabold text-[#1a0b05]">Reorder</span>
      </motion.div>
      <motion.div {...pop(0.4)} className="mt-auto mb-3 flex justify-around rounded-[18px] bg-[#241a16] py-2 text-[8.5px] font-bold text-white/50">
        <span className="rounded-xl bg-[#ff7a3d] px-2.5 py-1 text-[#1a0b05]">Home</span><span className="py-1">Menu</span><span className="py-1">Bag</span><span className="py-1">Orders</span>
      </motion.div>
    </div>
  );
}

function AlertScreen() {
  return (
    <div className="flex h-full flex-col items-center bg-gradient-to-b from-[#1b2533] to-[#0d1117] px-3 pt-14 text-center">
      <motion.p {...pop(0.05)} className="text-[44px] font-light leading-none tracking-tight">7:42</motion.p>
      <motion.p {...pop(0.1)} className="text-[11px] text-white/60">Friday, dinner rush</motion.p>
      {[
        { t: "New order · $42.50", d: "Delivery · 2 items · Sam R." },
        { t: "New order · $18.99", d: "Pickup at 7:55 · Jordan" },
      ].map((n, i) => (
        <motion.div
          key={n.t}
          initial={{ opacity: 0, y: -24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.35 + i * 0.45, type: "spring", stiffness: 320, damping: 22 }}
          className="mt-3 w-full rounded-2xl bg-white/15 p-2.5 text-left backdrop-blur"
        >
          <p className="text-[9px] font-semibold uppercase tracking-wide text-white/60">Your restaurant · now</p>
          <p className="text-[12px] font-bold">{n.t}</p>
          <p className="text-[10.5px] text-white/70">{n.d}</p>
        </motion.div>
      ))}
    </div>
  );
}

function PosScreen() {
  return (
    <div className="flex h-full flex-col items-center px-4 pt-12">
      <motion.p {...pop(0.05)} className="text-[11px] font-semibold text-white/50">Kitchen printer</motion.p>
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: 250 }}
        transition={{ delay: 0.25, duration: 1.1, ease: "easeOut" }}
        className="mt-4 w-[170px] overflow-hidden rounded-b-md bg-[#fbf8f2] font-mono text-[10px] text-[#111] shadow-lg"
      >
        <div className="p-3">
          <p className="text-center font-bold">WEBSITE ORDER #1042</p>
          <p className="mt-1 text-center font-bold">PAID ONLINE</p>
          <p className="mt-2 border-t border-dashed border-black/30 pt-2">1x Classic Nashville</p>
          <p className="pl-3 text-black/60">- Hot, add fries</p>
          <p>1x 3 Jumbo Tenders</p>
          <p className="pl-3 text-black/60">- Mild</p>
          <p className="mt-2 border-t border-dashed border-black/30 pt-2">PICKUP 7:55 PM</p>
          <p>Sam R.</p>
        </div>
      </motion.div>
      <motion.p {...pop(1.4)} className="mt-4 text-[11px] font-bold text-[#3ddc84]">Also in Square / Clover ✓</motion.p>
    </div>
  );
}
