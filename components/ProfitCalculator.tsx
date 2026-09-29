"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/track-client";
import { openWidget } from "@/lib/widget-cta";
import { PACKAGES } from "@/lib/pricing";

// The page's "see your own number" moment. The owner drags their monthly
// delivery-app sales and picks their DoorDash tier; RED shows what the apps take,
// GREEN what they keep on their own site (+ a conservative loyalty estimate), and
// how fast the site pays for itself. Every assumption is printed under the result.

const CARD_FEE = 0.03; // typical card processing on their own site
const LOYALTY_JOIN = 0.2; // 1 in 5 customers join the club (assumption, stated)
const LOYALTY_LIFT = 0.2; // members visit ~20% more (cited industry figure)
const TIERS = [15, 25, 30];
const SITE_PRICE = PACKAGES.find((p) => p.popular)?.price ?? 999;

const usd = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

// Animates a number toward its target (~450ms ease-out). Cheap: one rAF loop
// only while a value is changing.
function useTween(target: number) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / 450);
      const val = a + (target - a) * (1 - Math.pow(1 - k, 3));
      from.current = val;
      setV(val);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    // Safety net: if frames are throttled (background tab, low-power mode),
    // land on the real number anyway - never show a stale figure.
    const snap = setTimeout(() => {
      cancelAnimationFrame(raf);
      from.current = target;
      setV(target);
    }, 600);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(snap);
    };
  }, [target]);
  return v;
}

export function ProfitCalculator() {
  const [sales, setSales] = useState(6000);
  const [rate, setRate] = useState(25);
  const [used, setUsed] = useState(false);

  const touch = () => {
    if (used) return;
    setUsed(true);
    track("calc_used");
  };

  const lostMonth = sales * (rate / 100);
  const keptMonth = sales * (rate / 100 - CARD_FEE);
  const loyaltyMonth = sales * LOYALTY_JOIN * LOYALTY_LIFT;
  const gainMonth = keptMonth + loyaltyMonth;
  const paybackDays = Math.max(1, Math.ceil(SITE_PRICE / (gainMonth / 30)));

  const tLost = useTween(lostMonth);
  const tLostYear = useTween(lostMonth * 12);
  const tKept = useTween(keptMonth);
  const tLoyalty = useTween(loyaltyMonth);
  const tGainYear = useTween(gainMonth * 12);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-8">
      {/* inputs */}
      <label className="block">
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-base text-white/75">Your monthly sales through delivery apps</span>
          <span className="text-2xl font-semibold tabular-nums text-white">{usd(sales)}</span>
        </span>
        <input
          type="range"
          min={1000}
          max={30000}
          step={500}
          value={sales}
          onChange={(e) => {
            touch();
            setSales(Number(e.target.value));
          }}
          aria-label="Monthly sales through delivery apps"
          className="calc-range mt-4 w-full"
        />
      </label>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm text-white/60">DoorDash plan:</span>
        {TIERS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              touch();
              setRate(t);
            }}
            aria-pressed={rate === t}
            className={`min-h-[44px] rounded-full border px-4 text-sm font-semibold transition-colors ${
              rate === t ? "border-white bg-white text-ink" : "border-white/20 text-white/70 hover:border-white/50"
            }`}
          >
            {t}%
          </button>
        ))}
      </div>

      {/* every $100 order, as two bars */}
      <div className="mt-8 space-y-3">
        <p className="text-sm text-white/60">Every $100 order:</p>
        <Bar label="On the apps" keep={100 - rate} cut={rate} cutLabel={`-$${rate} commission`} tone="loss" />
        <Bar label="On your site" keep={97} cut={3} cutLabel="-$3 card fee" tone="gain" />
      </div>

      {/* results */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-loss-bright/30 bg-loss-bright/[0.08] p-5">
          <p className="text-sm font-medium text-loss-bright">Today, with the apps</p>
          <p className="mt-2 text-[clamp(2.25rem,8vw,3rem)] font-semibold leading-none tracking-[-0.02em] tabular-nums text-loss-bright">
            -{usd(tLost)}
            <span className="text-base font-medium text-loss-bright/70"> /month</span>
          </p>
          <p className="mt-2 text-white/70">
            <span className="font-semibold tabular-nums text-loss-bright">-{usd(tLostYear)}</span> a year in commission
          </p>
        </div>
        <div className="rounded-2xl border border-gain-bright/30 bg-gain-bright/[0.08] p-5">
          <p className="text-sm font-medium text-gain-bright">With your own site</p>
          <p className="mt-2 text-[clamp(2.25rem,8vw,3rem)] font-semibold leading-none tracking-[-0.02em] tabular-nums text-gain-bright">
            +{usd(tGainYear)}
            <span className="text-base font-medium text-gain-bright/70"> /year</span>
          </p>
          <ul className="mt-3 space-y-1 text-sm text-white/70">
            <li>
              <span className="font-semibold tabular-nums text-gain-bright">+{usd(tKept)}</span>/mo kept from commission
            </li>
            <li>
              <span className="font-semibold tabular-nums text-gain-bright">+{usd(tLoyalty)}</span>/mo from regulars coming back
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 rounded-2xl bg-white p-5 text-ink sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-semibold leading-snug">
          The {usd(SITE_PRICE)} site pays for itself in{" "}
          <span className="whitespace-nowrap text-gain">
            {paybackDays} {paybackDays === 1 ? "day" : "days"}
          </span>
          .
        </p>
        <button
          type="button"
          onClick={() => openWidget("offer")}
          className="min-h-[52px] shrink-0 rounded-xl bg-amber px-6 font-semibold text-ink hover:bg-[#f0904a]"
        >
          Get my free mockup
        </button>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-white/45">
        Estimates, not a guarantee. Assumes those orders move to your own site, with about 3% card processing. Regulars: if 1 in 5
        customers join your loyalty club and visit about 20% more often (industry average for loyalty members). The site is a
        one-time price; the loyalty club is a small monthly add-on.
      </p>
    </div>
  );
}

function Bar({ label, keep, cut, cutLabel, tone }: { label: string; keep: number; cut: number; cutLabel: string; tone: "loss" | "gain" }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-white/60">
        <span>{label}</span>
        <span className={tone === "loss" ? "text-loss-bright" : "text-white/50"}>
          you keep <span className={`font-semibold ${tone === "loss" ? "text-white" : "text-gain-bright"}`}>${keep}</span> · {cutLabel}
        </span>
      </div>
      <div className="flex h-4 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full transition-[width] duration-500 ease-out ${tone === "loss" ? "bg-white/70" : "bg-gain-bright"}`}
          style={{ width: `${keep}%` }}
        />
        <div
          className={`h-full transition-[width] duration-500 ease-out ${tone === "loss" ? "bg-loss-bright" : "bg-white/25"}`}
          style={{ width: `${cut}%` }}
        />
      </div>
    </div>
  );
}
