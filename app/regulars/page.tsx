import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import { MockupForm } from "@/components/MockupForm";
import { buildMetadata } from "@/lib/seo";
import { REGULARS, PACKAGES, formatUsd } from "@/lib/pricing";

// Offer v3 (docs/offer-v3.md in the builder panel): the Regulars Engine. A
// monthly, done-for-you service that turns delivery-app customers into
// regulars who order direct. Linked from DMs (?utm_source=instagram&utm_medium=dm)
// and from the home page offer. Only true claims: everything listed here is
// either live in the template or done by hand by Ben.

const R = REGULARS;
const lowestPack = Math.min(...PACKAGES.map((p) => p.price));

export const metadata: Metadata = buildMetadata({
  title: `${R.name}: your regulars, ordering straight from you | Starvega`,
  description: `Done-for-you direct orders for independent restaurants: a card in every delivery bag, a text club, ${R.textCampaignsPerMonth} text campaigns a month written for you. ${R.guaranteeOrders} direct orders in ${R.guaranteeDays} days or you don't pay.`,
  path: "/regulars",
});

const STEPS = [
  { n: "1", t: "A card goes in every bag", d: "Delivery and takeout bags get a card with your logo: \"Next time, order straight from us.\" A QR code and an offer, like a free drink." },
  { n: "2", t: "They scan, order and join", d: "The QR opens your own ordering site. They order, and join your text club with one tap." },
  { n: "3", t: "I text them on slow nights", d: `${R.textCampaignsPerMonth} texts a month, written and sent for you. Slow-night specials, birthdays, a new dish. You just say ok.` },
  { n: "4", t: "You see what came back", d: "A short report every month: direct orders, texts sent, codes used." },
];

const INCLUDED = [
  "Your own ordering site and phone app, with your menu and photos",
  "Bag cards designed for you, ready to print",
  "A text club: sign-up at the counter, on the tables and at checkout",
  `${R.textCampaignsPerMonth} text campaigns a month, written and sent by me`,
  "Your Google listing fixed so the order button points to you",
  "A review ask after orders, to grow your Google stars",
  "Every new order rings your phone and a kitchen screen",
  "Hosting, updates and small changes. No commission, ever.",
];

const FAQ = [
  { q: "Do I have to leave DoorDash or Uber Eats?", a: "No. Keep them for new customers. The bag card makes their next order come to you." },
  { q: "Is there a contract?", a: "No. It's month to month. Stop any month." },
  { q: "What do I have to do?", a: "Put a card in every bag, keep the QR on the counter, and say ok to each text before it goes out. I do the rest." },
  { q: "What counts as a direct order for the guarantee?", a: "Any paid order on your own site in your first 90 days." },
  { q: "Does it go into my POS?", a: "Orders ring on your phone and a tablet screen. A Square or Clover link is in early access." },
  { q: "Who gets the texts?", a: "Only people who joined your club. Every text has a way to opt out." },
];

export default function RegularsPage() {
  return (
    <>
      <main>
        {/* HERO */}
        <section className="px-4 pb-16 pt-28 sm:px-10 sm:pt-36">
          <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-amber-deep">Done for you · month to month</p>
              <h1 className="max-w-[16ch] font-display text-[clamp(2.4rem,6.5vw,4.4rem)] font-semibold leading-[0.98] tracking-[-0.02em] text-ink">
                Your regulars, ordering straight from you.
              </h1>
              <p className="mt-6 max-w-[52ch] text-[19px] leading-[1.55] text-ink">
                Keep the delivery apps for new customers. I turn them into regulars who order from your own site,
                and I fill your slow nights with texts to them.
              </p>
              <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-gain/30 bg-gain/10 px-4 py-2 text-[15px] font-medium text-gain">
                <span aria-hidden>✓</span>
                {R.guaranteeOrders} direct orders in {R.guaranteeDays} days, or you don&apos;t pay
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-paper p-6">
              <p className="text-lg font-semibold text-ink">Get your free bag card</p>
              <p className="mt-1 text-[15px] text-ink-soft">With your logo and a sample of your site. I&apos;ll text you within 24 hours.</p>
              <div className="mt-5">
                <MockupForm placement="regulars" />
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="border-t border-line px-4 py-20 sm:px-10">
          <div className="mx-auto w-full max-w-5xl">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">How it works</p>
            <h2 className="max-w-[20ch] text-[clamp(1.9rem,5vw,3rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-ink">
              From their first app order to their tenth order from you.
            </h2>
            <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s) => (
                <li key={s.n} className="rounded-2xl border border-line p-5">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-sm font-bold text-bg">{s.n}</span>
                  <p className="mt-4 text-lg font-semibold leading-snug text-ink">{s.t}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* WHAT'S IN IT + PRICE */}
        <section className="bg-ink px-4 py-20 text-bg sm:px-10 sm:py-24">
          <div className="mx-auto w-full max-w-5xl">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-amber">What you get</p>
            <h2 className="max-w-[22ch] text-[clamp(1.9rem,5vw,3rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
              Everything done for you. You run the kitchen.
            </h2>
            <ul className="mt-10 grid gap-x-10 gap-y-4 sm:grid-cols-2">
              {INCLUDED.map((p) => (
                <li key={p} className="flex gap-3 text-[17px] leading-snug text-white/90">
                  <span aria-hidden className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gain-bright text-xs font-bold text-ink">✓</span>
                  {p}
                </li>
              ))}
            </ul>

            <div className="mt-14 grid gap-4 lg:grid-cols-3">
              <div className="relative rounded-2xl border-2 border-amber bg-white/[0.04] p-6">
                <span className="absolute -top-3 left-6 rounded-full bg-amber px-3 py-0.5 text-xs font-semibold text-ink">
                  First {R.foundingSpots} restaurants
                </span>
                <p className="text-sm text-white/60">Founding partner</p>
                <p className="mt-2 text-4xl font-semibold tracking-tight">{formatUsd(R.foundingMonthly)}<span className="text-lg text-white/60">/mo</span></p>
                <p className="mt-1 text-sm text-gain-bright">$0 setup · locked for life</p>
                <p className="mt-4 text-[15px] leading-relaxed text-white/70">
                  Everything in the Regulars Engine. In return: a short video about your results, and ok to share your numbers.
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 p-6">
                <p className="text-sm text-white/60">{R.name}</p>
                <p className="mt-2 text-4xl font-semibold tracking-tight">{formatUsd(R.monthly)}<span className="text-lg text-white/60">/mo</span></p>
                <p className="mt-1 text-sm text-white/60">{formatUsd(R.setup)} setup · month to month</p>
                <p className="mt-4 text-[15px] leading-relaxed text-white/70">Everything above, done for you, with the {R.guaranteeOrders}-order guarantee.</p>
              </div>
              <div className="rounded-2xl border border-white/15 p-6">
                <p className="text-sm text-white/60">Own it</p>
                <p className="mt-2 text-4xl font-semibold tracking-tight">from {formatUsd(lowestPack)}</p>
                <p className="mt-1 text-sm text-white/60">paid once · you run it yourself</p>
                <p className="mt-4 text-[15px] leading-relaxed text-white/70">
                  Rather not pay monthly? Get the site once.{" "}
                  <Link href="/#offer" className="underline underline-offset-4 hover:text-amber">See the plans</Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* GUARANTEE */}
        <section className="px-4 py-20 sm:px-10">
          <div className="mx-auto w-full max-w-3xl rounded-3xl border-2 border-gain bg-gain/5 p-8 sm:p-10">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-gain">The guarantee</p>
            <h2 className="mt-3 text-[clamp(1.7rem,4.5vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-ink">
              {R.guaranteeOrders} orders or it&apos;s free.
            </h2>
            <p className="mt-4 text-[18px] leading-[1.55] text-ink">
              If your site doesn&apos;t bring you {R.guaranteeOrders} direct orders in your first {R.guaranteeDays} days,
              I refund your setup and keep working for free until it does.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
              Your part: a card in every delivery and takeout bag, the QR on your counter or tables, and an ok on each
              text within a day.
            </p>
          </div>
        </section>

        {/* COMPARE */}
        <section className="border-t border-line px-4 py-20 sm:px-10">
          <div className="mx-auto w-full max-w-5xl">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">Compared</p>
            <h2 className="max-w-[24ch] text-[clamp(1.8rem,4.5vw,2.6rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-ink">
              Software you run yourself, or a person who does it for you.
            </h2>
            <div className="mt-10 overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[34rem] text-left text-[15px]">
                <thead className="bg-paper text-sm text-ink-soft">
                  <tr>
                    <th className="p-4 font-medium"></th>
                    <th className="p-4 font-medium">Monthly</th>
                    <th className="p-4 font-medium">Who writes your texts</th>
                    <th className="p-4 font-medium">Bag cards</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-line">
                    <td className="p-4 font-medium">Owner.com</td>
                    <td className="p-4 tabular-nums">$499</td>
                    <td className="p-4 text-ink-soft">You (automated tools)</td>
                    <td className="p-4 text-ink-soft">No</td>
                  </tr>
                  <tr className="border-t border-line">
                    <td className="p-4 font-medium">Popmenu</td>
                    <td className="p-4 tabular-nums">$179 - $499</td>
                    <td className="p-4 text-ink-soft">You (tools)</td>
                    <td className="p-4 text-ink-soft">No</td>
                  </tr>
                  <tr className="border-t border-line bg-gain/5">
                    <td className="p-4 font-semibold">Starvega {R.name}</td>
                    <td className="p-4 font-semibold tabular-nums">{formatUsd(R.monthly)}</td>
                    <td className="p-4 font-medium">Me, for you</td>
                    <td className="p-4 font-medium">Yes, designed for you</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-ink-soft">Published prices from owner.com/pricing and Popmenu&apos;s pricing page, November 2026.</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-line px-4 py-20 sm:px-10">
          <div className="mx-auto w-full max-w-3xl">
            <h2 className="text-[clamp(1.8rem,4.5vw,2.6rem)] font-semibold tracking-[-0.02em] text-ink">Questions</h2>
            <dl className="mt-8 divide-y divide-line border-y border-line">
              {FAQ.map((f) => (
                <div key={f.q} className="py-5">
                  <dt className="text-lg font-semibold text-ink">{f.q}</dt>
                  <dd className="mt-2 text-[16px] leading-relaxed text-ink-soft">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-ink px-4 py-20 text-bg sm:px-10 sm:py-24">
          <div className="mx-auto w-full max-w-2xl">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-amber">Free, no obligation</p>
            <h2 className="text-[clamp(2rem,6vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
              See your bag card before you spend a dollar.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/70">
              Tell me who you are. I&apos;ll make your card and a sample of your site, and text you within 24 hours.
            </p>
            <div className="mt-8">
              <MockupForm placement="regulars_final" onInk />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
