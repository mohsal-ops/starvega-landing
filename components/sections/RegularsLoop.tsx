"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";

// SECTION - THE LOOP (offer v3). An animated, self-playing story of how one
// delivery-app customer becomes a regular who orders straight from you:
// app order -> card in the bag -> scan -> order on your site -> joins the club
// -> a text on a slow night -> back again. Tabs let them jump to any beat.
// Pure HTML/CSS drawings (no images), plays only while on screen, and holds
// still for people who prefer reduced motion.

const BEATS = [
  { k: "app", n: "1", t: "They find you on an app", d: "A new customer orders from you on DoorDash or Uber Eats. Good: the app did its job." },
  { k: "bag", n: "2", t: "Your card is in the bag", d: "\"Loved it? Next time, order straight from us.\" A QR code and a small thank-you, like a free drink." },
  { k: "scan", n: "3", t: "Next time, they scan", d: "The QR opens your own site. Your menu, your photos, your prices." },
  { k: "order", n: "4", t: "They order from you", d: "Pickup or delivery. The money goes to your account. No app cut." },
  { k: "club", n: "5", t: "They join your text club", d: "One tap at checkout. Now you have their number, not the app." },
  { k: "text", n: "6", t: "Slow Tuesday? I text them", d: "\"Tuesday only: free fries with any order.\" They order again. That's a regular." },
] as const;

const MS = 3400;

function Phone({ children, tint = "#fff" }: { children: React.ReactNode; tint?: string }) {
  return (
    <div className="relative mx-auto h-[380px] w-[200px] rounded-[38px] border-[7px] border-[#111] bg-[#111] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] sm:h-[420px] sm:w-[220px]">
      <div className="absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
      <div className="relative h-full w-full overflow-hidden rounded-[30px]" style={{ background: tint }}>
        {children}
      </div>
    </div>
  );
}

const pop = { initial: { opacity: 0, y: 18, scale: 0.96 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -12, scale: 0.98 } };

function Scene({ k }: { k: (typeof BEATS)[number]["k"] }) {
  if (k === "app")
    return (
      <Phone tint="#fff5f2">
        <div className="px-4 pt-10">
          <div className="h-3 w-24 rounded bg-[#ff5a3c]/80" />
          <p className="mt-4 text-[11px] font-semibold text-stone-500">DELIVERY APP</p>
          <div className="mt-2 rounded-2xl bg-white p-3 shadow-sm">
            <div className="h-20 rounded-xl bg-gradient-to-br from-amber-200 to-orange-300" />
            <p className="mt-2 text-sm font-semibold text-stone-800">Your Restaurant</p>
            <p className="text-[11px] text-stone-500">4.8 ★ · 25 min</p>
          </div>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6 }} className="mt-4 rounded-full bg-[#ff5a3c] py-2.5 text-center text-sm font-semibold text-white">
            Order placed ✓
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-3 text-center text-[11px] text-stone-500">
            First time. The app found them for you.
          </motion.p>
        </div>
      </Phone>
    );
  if (k === "bag")
    return (
      <div className="relative mx-auto h-[400px] w-[280px]">
        {/* paper bag */}
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[230px] -translate-x-1/2 rounded-b-xl rounded-t-sm bg-gradient-to-b from-[#d9b98f] to-[#b98f60] shadow-[0_30px_60px_-25px_rgba(60,30,0,0.6)]">
          <div className="absolute inset-x-0 top-0 h-6 bg-[repeating-linear-gradient(90deg,#c9a274_0_10px,#d9b98f_10px_20px)]" />
        </div>
        {/* the card dropping in */}
        <motion.div
          initial={{ y: -160, rotate: -14, opacity: 0 }}
          animate={{ y: 0, rotate: -6, opacity: 1 }}
          transition={{ type: "spring", stiffness: 90, damping: 13, delay: 0.2 }}
          className="absolute left-1/2 top-[40px] w-[170px] -translate-x-1/2 rounded-xl bg-white p-3 shadow-xl"
        >
          <div className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-ink text-xs font-bold text-white">YR</div>
          <p className="mt-2 text-center text-[13px] font-bold leading-tight text-stone-900">Loved it? Next time, order straight from us.</p>
          <p className="mx-auto mt-2 w-fit rounded-full bg-amber px-2.5 py-1 text-[10px] font-bold text-ink">Free drink next order</p>
          <div className="mx-auto mt-2 grid h-14 w-14 grid-cols-5 gap-[2px] rounded bg-white p-1">
            {Array.from({ length: 25 }).map((_, i) => (
              <span key={i} className={[0, 1, 3, 5, 6, 8, 12, 14, 16, 18, 19, 21, 23, 24].includes(i) ? "bg-stone-900" : "bg-transparent"} />
            ))}
          </div>
        </motion.div>
      </div>
    );
  if (k === "scan")
    return (
      <Phone tint="#0d0d0f">
        <div className="relative h-full w-full">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,#3a3a3a,#0d0d0f_70%)]" />
          <div className="absolute left-1/2 top-[38%] h-28 w-28 -translate-x-1/2 -translate-y-1/2">
            <div className="grid h-full w-full grid-cols-5 gap-[3px] rounded-md bg-white p-2">
              {Array.from({ length: 25 }).map((_, i) => (
                <span key={i} className={[0, 1, 3, 5, 6, 8, 12, 14, 16, 18, 19, 21, 23, 24].includes(i) ? "bg-stone-900" : ""} />
              ))}
            </div>
            <motion.div
              className="absolute inset-x-0 h-0.5 bg-gain-bright shadow-[0_0_12px_#3ddc84]"
              initial={{ top: "0%" }}
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            {["left-0 top-0 border-l-4 border-t-4", "right-0 top-0 border-r-4 border-t-4", "left-0 bottom-0 border-b-4 border-l-4", "right-0 bottom-0 border-b-4 border-r-4"].map((c) => (
              <span key={c} className={`absolute h-6 w-6 rounded-sm border-white ${c}`} />
            ))}
          </div>
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2 }} className="absolute inset-x-3 bottom-8 rounded-2xl bg-white/95 p-3 text-center">
            <p className="text-[11px] text-stone-500">Open in Safari</p>
            <p className="text-sm font-semibold text-stone-900">yourrestaurant.com</p>
          </motion.div>
        </div>
      </Phone>
    );
  if (k === "order")
    return (
      <Phone>
        <div className="px-4 pt-10">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-[10px] font-bold text-white">YR</span>
            <span className="text-sm font-semibold">Your Restaurant</span>
          </div>
          <div className="mt-4 space-y-2">
            {[["Chicken shawarma plate", "$14.99"], ["Garlic fries", "$4.50"], ["Mango lassi", "Free 🎁"]].map(([a, b], i) => (
              <motion.div key={a} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 + i * 0.25 }} className="flex justify-between rounded-xl bg-stone-50 px-3 py-2 text-[12px]">
                <span>{a}</span>
                <span className="font-semibold">{b}</span>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="mt-4 rounded-xl border border-dashed border-gain p-2.5 text-center text-[12px]">
            <span className="text-stone-500">App fee on this order: </span>
            <span className="font-bold text-gain">$0</span>
          </motion.div>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.6 }} className="mt-3 rounded-full bg-ink py-2.5 text-center text-sm font-semibold text-white">
            Pay $19.49
          </motion.div>
        </div>
      </Phone>
    );
  if (k === "club")
    return (
      <Phone>
        <div className="px-4 pt-14 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12 }} className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gain text-3xl text-white">
            ✓
          </motion.div>
          <p className="mt-4 text-lg font-semibold">Order received!</p>
          <p className="text-[12px] text-stone-500">Ready in 20 minutes</p>
          <motion.label initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="mt-6 flex items-center gap-2 rounded-2xl bg-amber/15 p-3 text-left text-[12px]">
            <motion.span initial={{ backgroundColor: "#ffffff" }} animate={{ backgroundColor: "#1f9d55" }} transition={{ delay: 1.4 }} className="grid h-5 w-5 shrink-0 place-items-center rounded border border-stone-300 text-[11px] text-white">
              ✓
            </motion.span>
            Text me deals from Your Restaurant
          </motion.label>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }} className="mt-3 text-[11px] font-semibold text-gain">
            +1 to your text club
          </motion.p>
        </div>
      </Phone>
    );
  return (
    <Phone tint="#f2f2f7">
      <div className="px-3 pt-10">
        <p className="text-center text-[11px] text-stone-500">Tuesday 4:12 PM</p>
        <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="mt-3 w-[85%] rounded-2xl rounded-tl-sm bg-white p-3 text-[12px] shadow-sm">
          <span className="font-semibold">Your Restaurant:</span> Tuesday only 🍟 Free fries with any order tonight. Tap to order: yourrestaurant.com
        </motion.div>
        <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.2 }} className="ml-auto mt-3 w-fit rounded-2xl rounded-tr-sm bg-[#0a84ff] px-3 py-2 text-[12px] text-white">
          omw 😋
        </motion.div>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.9 }} className="mt-6 rounded-2xl bg-ink p-3 text-center text-white">
          <p className="text-[11px] text-white/60">Your dashboard</p>
          <p className="text-lg font-semibold">+1 order · from a regular</p>
        </motion.div>
      </div>
    </Phone>
  );
}

export default function RegularsLoop() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!inView || paused || reduce) return;
    const t = setTimeout(() => setI((x) => (x + 1) % BEATS.length), MS);
    return () => clearTimeout(t);
  }, [i, inView, paused, reduce]);

  const b = BEATS[i];
  return (
    <section id="loop" className="relative overflow-hidden bg-[#fbf7f1] px-4 py-20 sm:px-10 sm:py-28">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-amber/20 blur-3xl" />
      <div ref={ref} className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1fr]">
        <div>
          <p data-reveal className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-amber-deep">How it works, in 30 seconds</p>
          <h2 data-reveal className="text-[clamp(2rem,5.5vw,3.4rem)] font-semibold leading-[1.04] tracking-[-0.02em] text-ink">
            The apps bring them <span className="text-loss">once</span>. We bring them <span className="text-gain">back</span>, to you.
          </h2>
          <ol className="mt-10 space-y-2" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            {BEATS.map((x, n) => (
              <li key={x.k}>
                <button
                  type="button"
                  onClick={() => setI(n)}
                  className={`group flex w-full items-start gap-4 rounded-2xl p-3 text-left transition-colors ${n === i ? "bg-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)]" : "hover:bg-white/60"}`}
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors ${n === i ? "bg-ink text-white" : n < i ? "bg-gain text-white" : "bg-white text-ink-soft"}`}>
                    {n < i ? "✓" : x.n}
                  </span>
                  <span className="min-w-0">
                    <span className={`block text-[17px] font-semibold ${n === i ? "text-ink" : "text-ink-soft"}`}>{x.t}</span>
                    <AnimatePresence initial={false}>
                      {n === i && (
                        <motion.span initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="block overflow-hidden text-[15px] leading-relaxed text-ink-soft">
                          {x.d}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {n === i && !reduce && !paused && inView && (
                      <motion.span key={`bar-${i}`} className="mt-2 block h-0.5 rounded-full bg-amber" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: MS / 1000, ease: "linear" }} />
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="relative order-first grid min-h-[480px] place-items-center pb-12 lg:order-none lg:min-h-[500px]">
          <div aria-hidden className="absolute h-[360px] w-[360px] rounded-full bg-[conic-gradient(from_90deg,#e8833a33,#3ddc8433,#e8833a33)] blur-2xl" />
          <AnimatePresence mode="wait">
            <motion.div key={b.k} {...(reduce ? {} : pop)} transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }} className="relative">
              <Scene k={b.k} />
            </motion.div>
          </AnimatePresence>
          <p className="absolute bottom-0 text-center text-sm text-ink-soft">
            Step {b.n} of {BEATS.length} · {b.t}
          </p>
        </div>
      </div>
    </section>
  );
}
