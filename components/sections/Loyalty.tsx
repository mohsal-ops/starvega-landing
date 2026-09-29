import { PhoneMockup } from "@/components/PhoneMockup";

// SECTION 4 - LOYALTY CLUB. The second half of the pitch: the site gets the
// order without commission, the club brings that customer back. Shown as what
// the customer actually receives (the phone), with cited industry figures in
// green. Truthful capability only; the stats are industry benchmarks (linked).

const FEATURES = [
  { t: "They join in one tap", d: "At checkout or by scanning a QR code on the table. Opt-in only, so it stays legal and welcome." },
  { t: "Birthday offers go out on their own", d: "Set it once. Every member gets a treat before their birthday, every year." },
  { t: "Slow Tuesday? Send a special", d: "Text or email every regular in one tap from your dashboard." },
  { t: "See what each promo earned", d: "Every offer carries a code, so you see exactly how many came back and spent." },
];

export default function Loyalty() {
  return (
    <section id="loyalty" className="overflow-hidden bg-bg px-4 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p data-reveal className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-gain">
            Loyalty club · add to any plan
          </p>
          <h2 data-reveal className="text-[clamp(2rem,5.5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
            The apps keep your customers. <span className="text-gain">Your club brings them back.</span>
          </h2>

          <div data-reveal-stagger className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-gain/25 bg-gain/[0.06] p-4">
              <p className="text-[clamp(1.75rem,6vw,2.5rem)] font-semibold leading-none tracking-[-0.02em] text-gain">65-80%</p>
              <p className="mt-2 text-sm leading-snug text-ink-soft">
                of restaurant sales come from regulars.{" "}
                <a
                  href="https://www.restroworks.com/blog/customer-retention-statistics-restaurants/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  Source
                </a>
              </p>
            </div>
            <div className="rounded-2xl border border-gain/25 bg-gain/[0.06] p-4">
              <p className="text-[clamp(1.75rem,6vw,2.5rem)] font-semibold leading-none tracking-[-0.02em] text-gain">+20%</p>
              <p className="mt-2 text-sm leading-snug text-ink-soft">
                more visits from loyalty members.{" "}
                <a
                  href="https://merchants.doordash.com/en-us/blog/restaurant-loyalty-programs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  Source
                </a>
              </p>
            </div>
          </div>

          <ul data-reveal-stagger className="mt-8 space-y-5">
            {FEATURES.map((f) => (
              <li key={f.t} className="flex gap-4">
                <span aria-hidden className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gain text-xs font-bold text-white">
                  ✓
                </span>
                <div>
                  <p className="font-semibold text-ink">{f.t}</p>
                  <p className="mt-0.5 leading-relaxed text-ink-soft">{f.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div data-reveal className="relative flex justify-center">
          <div aria-hidden className="absolute inset-x-8 top-10 bottom-10 -z-10 rounded-full bg-gain/15 blur-3xl" />
          <PhoneMockup className="float" />
        </div>
      </div>
    </section>
  );
}
