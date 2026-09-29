import Link from "next/link";

// SECTION 2 - PROBLEM + FIX (was Agitate + Turn). One screen: what the apps cost
// (DoorDash's published 15-30% range, worked on a stated example volume), then
// the way out. Numbers are static text - no count-up JS needed to read them.

const COSTS = [
  { big: "30%", small: "the top DoorDash commission on every delivery order (their range is 15-30%)." },
  { big: "$1,800", unit: "/mo", small: "gone to commission on $6,000 a month of app orders." },
  { big: "$20K", unit: "/yr", small: "of revenue you already earned, handed to the app every year." },
];

const FIX = [
  { k: "Zero commission", v: "Orders come straight to you. No cut, ever." },
  { k: "Customers come back", v: "Add a loyalty club: texts, emails and rewards you control." },
  { k: "Paid once, yours", v: "One-time price. No monthly platform fee, no contract." },
];

export default function Problem() {
  return (
    <section id="problem" className="bg-ink px-4 py-20 text-bg sm:px-10 sm:py-28">
      <div className="mx-auto w-full max-w-5xl">
        <p data-reveal className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-amber">
          The math nobody shows you
        </p>
        <h2 data-reveal className="max-w-3xl text-[clamp(1.9rem,5.5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.02em]">
          The apps bring you a customer once, then charge you rent on them forever.
        </h2>

        <div data-reveal-stagger className="mt-12 grid gap-8 sm:mt-16 sm:grid-cols-3">
          {COSTS.map((c) => (
            <div key={c.big} className="border-t border-white/15 pt-5">
              <p className="flex items-baseline gap-1">
                <span className="text-[clamp(2.75rem,10vw,4.5rem)] font-semibold leading-none tracking-[-0.03em] text-amber tabular-nums">
                  {c.big}
                </span>
                {c.unit && <span className="text-lg font-medium text-white/40">{c.unit}</span>}
              </p>
              <p className="mt-3 text-base leading-relaxed text-white/70">{c.small}</p>
            </div>
          ))}
        </div>
        <Link
          href="/learn/delivery-app-commissions"
          className="mt-8 inline-block text-sm text-white/60 underline decoration-white/30 underline-offset-4 hover:text-white"
        >
          See how these numbers are calculated →
        </Link>

        <div className="mt-16 border-t border-white/15 pt-12 sm:mt-20">
          <p data-reveal className="mb-8 text-[clamp(1.4rem,3.5vw,2rem)] font-semibold tracking-[-0.01em]">
            The way out: your own site, your own orders, your own regulars.
          </p>
          <div data-reveal-stagger className="grid gap-8 sm:grid-cols-3">
            {FIX.map((f) => (
              <div key={f.k} className="border-t-2 border-amber pt-4">
                <h3 className="text-xl font-semibold tracking-tight">{f.k}</h3>
                <p className="mt-2 text-base leading-relaxed text-white/70">{f.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
