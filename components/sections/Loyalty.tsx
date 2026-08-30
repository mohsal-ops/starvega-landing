import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { PhoneMockup } from "@/components/PhoneMockup";

// Loyalty & text-marketing add-on. Truthful capability description only - the
// stat block is framed as an INDUSTRY benchmark, never a claim about Starvega's
// own results. Matches the OFF+BRAND system (monochrome on white, amber for CTAs
// only) and the funnel's data-reveal motion hooks.

function IconGift() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="8" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8M12 8v13" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8S10.5 3.5 8 4.5 9 8 12 8Zm0 0s1.5-4.5 4-3.5S15 8 12 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function IconSend() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 12l16-8-6 16-3.5-6L4 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function IconLoop() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 11a8 8 0 0 1 14-5l2 2M20 13a8 8 0 0 1-14 5l-2-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 3v5h-5M4 21v-5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const CARDS = [
  { icon: <IconGift />, title: "Birthday offers, automatic",
    body: "Diners share a birthday once; a treat text goes out a week before, every year, on its own." },
  { icon: <IconSend />, title: "One-click specials",
    body: "Slow Tuesday? Text every regular a same-day offer from your dashboard in seconds.", mockup: true },
  { icon: <IconLoop />, title: "Automatic re-engagement",
    body: "Turn one-time customers into regulars with the occasional nudge - the repeat business the big apps keep for themselves." },
];

export default function Loyalty() {
  return (
    <section id="loyalty" className="bg-bg px-6 py-24 text-ink sm:px-10 sm:py-32">
      <div className="mx-auto w-full max-w-6xl">
        {/* ── Centerpiece: headline/intro + phone ── */}
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <p data-reveal className="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-amber">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
              Optional add-on
            </p>
            <h2 data-reveal-chars className="text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
              Turn one-time diners into regulars.
            </h2>
            <p data-reveal-words className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
              Collect a phone number at checkout (only if the customer opts in) and keep your
              regulars coming back with the occasional text. Add it whenever you&apos;re ready.
            </p>
          </div>

          <Reveal className="lg:justify-self-end">
            <PhoneMockup />
          </Reveal>
        </div>

        {/* ── The money argument: honest industry benchmark ── */}
        <Reveal className="mt-20 sm:mt-24">
          <div className="rounded-xl border border-ash bg-paper p-8 sm:p-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">Industry benchmark</p>
            <div className="mt-6 grid gap-8 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-12">
              <div className="flex gap-10">
                <div>
                  <div className="text-5xl font-semibold tracking-[-0.03em] sm:text-6xl">
                    <CountUp to={35} suffix="%" />
                  </div>
                  <p className="mt-1 max-w-[16ch] text-sm text-ink-soft">avg. birthday-text redemption rate</p>
                </div>
                <div className="border-l border-ash pl-10">
                  <div className="text-5xl font-semibold tracking-[-0.03em] sm:text-6xl">
                    <CountUp to={42} prefix="$" />
                  </div>
                  <p className="mt-1 max-w-[16ch] text-sm text-ink-soft">roughly, per redemption</p>
                </div>
              </div>
              <p className="text-lg leading-relaxed text-ink">
                Birthday text campaigns average a 35% redemption rate industry-wide, worth roughly $42
                per redemption. For a restaurant with a few hundred regulars on the list, that&apos;s
                real repeat business most independent spots aren&apos;t capturing at all right now.
              </p>
            </div>
          </div>
        </Reveal>

        {/* ── Feature cards (staggered reveal) ── */}
        <div data-reveal-stagger className="mt-16 grid items-start gap-6 sm:grid-cols-3">
          {CARDS.map((c) => (
            <div key={c.title} className="rounded-xl border border-line bg-surface p-6">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white">{c.icon}</span>
              <h3 className="mt-4 text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 leading-relaxed text-ink-soft">{c.body}</p>

              {c.mockup && (
                <div className="mt-5 rounded-lg border border-line bg-paper p-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-ink-soft">New special</p>
                  <div className="mt-2 rounded-md border border-line bg-white px-3 py-2 text-[13px] leading-snug text-ink">
                    Free fries with any sandwich today 🍟
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-ink-soft">36 / 480</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber px-3 py-1.5 text-[12px] font-semibold text-ink">
                      Send to 240 regulars
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Compliance footer (wording unchanged, just smaller/muted) ── */}
        <p className="mt-12 border-t border-line pt-6 text-xs leading-relaxed text-ink-soft">
          Opt-in only, one tap to unsubscribe - built to the messaging rules, so it stays yours and
          stays compliant.
        </p>
      </div>
    </section>
  );
}
