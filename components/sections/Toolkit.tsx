"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
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
    body: "People order on your site. You keep all the money and all your customers. No app in the middle.",
    money: `At ${s.estimatedOrdersPerDay} orders a day, that's about ${formatUsd(s.monthlySavings)} a month you keep.`,
    screen: () => <OrderScreen />,
  },
  {
    id: "app",
    feature: "installable_app",
    kicker: "Instant phone app",
    title: "Your restaurant on their home screen.",
    body: "Customers tap one button and you are on their phone. Your logo. Your colors. One tap to order again. Comes with Standard. Want a real App Store app too? Add it.",
    money: "When ordering again is easy, people order again more.",
    screen: () => <AppScreen />,
  },
  {
    id: "alerts",
    feature: "order_push",
    kicker: "Never miss an order",
    title: "Every order pings your phone.",
    body: "A new order? Your phone buzzes. The kitchen screen rings until someone taps it. No order gets lost in a rush.",
    money: "Missing one order a night costs about $750 a month. Not anymore.",
    screen: () => <AlertScreen />,
  },
  {
    id: "pos",
    feature: "pos_square",
    kicker: "Square & Clover",
    title: "Orders land in your POS.",
    body: "Paid orders go right into Square or Clover and print in the kitchen. No typing them in again.",
    money: "Less work for your staff. Fewer mistakes.",
    screen: () => <PosScreen />,
  },
];

export default function Toolkit() {
  const slides = SLIDES.filter((x) => featureStatus(x.feature) !== "hidden");
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  const cards = useRef<(HTMLElement | null)[]>([]);
  const phones = useRef<(HTMLDivElement | null)[]>([]);
  const texts = useRef<(HTMLDivElement | null)[]>([]);
  const nums = useRef<(HTMLSpanElement | null)[]>([]);
  const bar = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  // Swipe-linked motion: every frame of the drag, each slide gets an offset
  // o (0 = centered, +-1 = one slide away). Phones turn in 3D like a carousel,
  // text slides at a different speed, the big number drifts the other way.
  // Pure style writes on refs (no React re-render per frame).
  const paint = useCallback(() => {
    raf.current = 0;
    const el = track.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let best = 0;
    let bestD = Infinity;
    cards.current.forEach((n, i) => {
      if (!n) return;
      const d = n.offsetLeft + n.offsetWidth / 2 - mid;
      const o = Math.max(-1.6, Math.min(1.6, d / n.offsetWidth));
      const a = Math.min(Math.abs(o), 1);
      if (Math.abs(d) < bestD) {
        bestD = Math.abs(d);
        best = i;
      }
      n.style.opacity = String(1 - a * 0.55);
      n.style.transform = reduce ? "" : `scale(${1 - a * 0.06})`;
      const ph = phones.current[i];
      if (ph && !reduce)
        ph.style.transform = `perspective(1000px) rotateY(${o * -32}deg) translateX(${o * -46}px) translateZ(${-a * 90}px) rotateZ(${o * 3}deg)`;
      const tx = texts.current[i];
      if (tx && !reduce) tx.style.transform = `translateX(${o * 70}px)`;
      const nm = nums.current[i];
      if (nm && !reduce) nm.style.transform = `translateX(${o * -140}px)`;
    });
    const max = el.scrollWidth - el.clientWidth;
    if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.max(0.04, el.scrollLeft / max) : 1})`;
    setActive((p) => (p === best ? p : best));
  }, []);
  const onScroll = useCallback(() => {
    if (!raf.current) raf.current = requestAnimationFrame(paint);
  }, [paint]);

  const go = (i: number) => {
    const el = track.current;
    const n = el?.children[i] as HTMLElement | undefined;
    if (!el || !n) return;
    el.scrollTo({ left: n.offsetLeft - (el.clientWidth - n.offsetWidth) / 2, behavior: "smooth" });
  };

  useEffect(() => {
    const el = track.current;
    el?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    paint();
    return () => {
      el?.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf.current);
    };
  }, [onScroll, paint]);

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
            <article
              key={sl.id}
              ref={(n) => {
                cards.current[i] = n;
              }}
              onClick={() => !on && go(i)}
              className="relative flex w-[84vw] max-w-[920px] shrink-0 snap-center flex-col items-center gap-5 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-5 will-change-transform sm:p-10 md:flex-row-reverse md:items-center md:gap-10"
            >
              <span
                aria-hidden
                ref={(n) => {
                  nums.current[i] = n;
                }}
                className="pointer-events-none absolute -right-4 -top-6 select-none font-display text-[150px] font-semibold leading-none text-white/[0.05] will-change-transform md:text-[220px]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="relative shrink-0">
                <div
                  aria-hidden
                  className={`absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber/30 blur-[70px] transition-opacity duration-500 ${on ? "opacity-100" : "opacity-0"}`}
                />
                <div
                  ref={(n) => {
                    phones.current[i] = n;
                  }}
                  className="relative origin-center will-change-transform"
                >
                  <Phone active={on}>{sl.screen()}</Phone>
                </div>
              </div>
              <div
                ref={(n) => {
                  texts.current[i] = n;
                }}
                className="relative w-full flex-1 will-change-transform"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-amber sm:text-xs">{sl.kicker}</span>
                  {soon && (
                    <span className="rounded-full border border-white/25 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/70">
                      Early access
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-display text-[26px] font-semibold leading-[1.05] tracking-[-0.02em] sm:mt-3 sm:text-4xl">{sl.title}</h3>
                <p className="mt-4 hidden max-w-[46ch] text-[17px] leading-[1.55] text-white/70 sm:block">{sl.body}</p>
                <p className="mt-3 flex max-w-[46ch] items-start gap-2.5 rounded-2xl bg-gain-bright/[0.1] px-3.5 py-2.5 text-[14px] font-medium leading-snug text-gain-bright sm:mt-6 sm:px-4 sm:py-3 sm:text-[15px]">
                  <span aria-hidden className="mt-0.5">↗</span>
                  {sl.money}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mx-auto mt-6 h-[3px] w-40 overflow-hidden rounded-full bg-white/10">
        <div ref={bar} className="h-full w-full origin-left rounded-full bg-amber" style={{ transform: "scaleX(0.04)" }} />
      </div>
      <div className="mt-2 flex justify-center gap-2" role="tablist" aria-label="Slides">
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
        These are guesses: {s.estimatedOrdersPerDay} orders a day, {formatUsd(s.avgOrderValue)} each, and a {s.commissionPct}% app fee. Yours will be different.
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
    <div className="relative h-[380px] w-[187px] rounded-[38px] sm:h-[480px] sm:w-[236px] sm:rounded-[44px] bg-[#0b0b0b] p-[9px] shadow-[0_30px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/15">
      <div className="absolute left-1/2 top-[13px] z-20 h-[18px] w-[62px] -translate-x-1/2 rounded-full bg-black sm:top-[16px] sm:h-[22px] sm:w-[78px]" />
      <div className="relative h-full w-full overflow-hidden rounded-[30px] bg-[#120d0b] text-[#fbf4ee] sm:rounded-[36px]">
        <div className="h-[462px] w-[218px] origin-top-left scale-[0.776] sm:scale-100">
        {/* Always rendered (visible mid-swipe); re-keyed on arrival so its entrance animation replays. */}
          <div key={active ? "on" : "off"} className="h-full">{children}</div>
        </div>
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
