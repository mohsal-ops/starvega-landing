import { WidgetCtaButton } from "@/components/WidgetCta";

// SECTION - HOW IT WORKS. For the visitor who's already sold: the whole road
// from "free mockup" to "taking orders", with what THEY do vs what I do at each
// step, so buying feels small and known. Two doors at the end: the free mockup
// (default) or straight to plans for the ready-now buyer.
// Copy rule: no fixed timelines beyond what the FAQ promises.

const STEPS: { title: string; blurb: string; you: string[]; me: string[] }[] = [
  {
    title: "Get your free bag card + sample",
    blurb: "Fill in 3 boxes. No payment. You see your card and your site before anything else.",
    you: ["Your name, restaurant, and a number I can text"],
    me: ["Design your bag card with your logo", "Build a sample site with your name and menu", "Text you both within 24h"],
  },
  {
    title: "Pick a plan",
    blurb: "Two minutes. Card or PayPal. Month to month, or pay once to own it.",
    you: ["Choose Founding partner, Regulars Engine, or Own it"],
    me: ["Open your Starvega account", "Everything I do shows up there"],
  },
  {
    title: "Send your basics",
    blurb: "A 10-minute form. Photos from your phone are fine.",
    you: ["Your logo, if you have one", "Menu: a photo, PDF or link", "Food photos, hours, address"],
    me: ["Build your real menu with prices and options", "Write your pages and set up Google basics"],
  },
  {
    title: "Connect payments",
    blurb: "Order money goes straight to your own account. I help with every click.",
    you: ["Connect your Stripe (or I help you make one)", "Your domain, or I help you get one"],
    me: ["Wire up ordering, receipts and order alerts", "Set up your text club and bag card code"],
  },
  {
    title: "Go live, cards in the bags",
    blurb: "You check everything. Then we turn it on and the 90 days start.",
    you: ["Place a test order", "Print the cards, put one in every bag", "QR on the counter"],
    me: ["Launch and fix your Google listing", "Send you the print-ready card file"],
  },
  {
    title: "Every month after",
    blurb: "You run the kitchen. I bring the regulars back.",
    you: ["Say ok to each text before it goes out"],
    me: ["Write and send 2 texts a month", "A short report in your account", "Changes whenever you ask"],
  },
];

export default function Steps() {
  return (
    <section id="steps" className="bg-paper px-4 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p data-reveal className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
            How it works
          </p>
          <h2 data-reveal className="text-[clamp(2rem,5.5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
            From free bag card to regulars coming back, in 6 steps.
          </h2>
          <p data-reveal className="mt-4 max-w-md text-lg leading-relaxed text-ink-soft">
            You send the things only you have. I do the rest.
          </p>
          <div data-reveal className="mt-8 flex flex-wrap items-center gap-3">
            <WidgetCtaButton entryPoint="offer">Start with a free mockup</WidgetCtaButton>
            <a href="#plans" className="inline-flex min-h-[44px] items-center rounded-full border border-ink px-5 font-medium">Skip it, see plans</a>
          </div>
        </div>

        <ol data-reveal-stagger className="relative space-y-4">
          <span aria-hidden className="absolute bottom-6 left-[27px] top-6 w-px bg-ash sm:left-[31px]" />
          {STEPS.map((s, n) => (
            <li key={s.title} className="relative flex gap-4 sm:gap-5">
              <span
                className={`relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border text-lg font-semibold tabular-nums sm:h-16 sm:w-16 ${
                  n === STEPS.length - 1 ? "border-gain bg-gain text-white" : "border-ash bg-bg text-ink"
                }`}
              >
                {n === STEPS.length - 1 ? "✓" : n + 1}
              </span>
              <div className="flex-1 rounded-2xl border border-line bg-bg p-5 sm:p-6">
                <h3 className="text-xl font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-1.5 leading-relaxed text-ink-soft">{s.blurb}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-deep">You</p>
                    <ul className="space-y-1.5 text-[15px]">
                      {s.you.map((x) => (
                        <li key={x} className="flex gap-2">
                          <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-gain">Me</p>
                    <ul className="space-y-1.5 text-[15px] text-ink-soft">
                      {s.me.map((x) => (
                        <li key={x} className="flex gap-2">
                          <span aria-hidden className="text-gain">✓</span>
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
