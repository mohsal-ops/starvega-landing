import Link from "next/link";
import { ChoosePlanButton } from "@/components/packs/ChoosePlanButton";
import { WidgetCtaButton } from "@/components/WidgetCta";
import { PACKAGES, REGULARS, formatUsd } from "@/lib/pricing";
import { foundingSpotsLeft } from "@/lib/billing";

// SECTION - THE OFFER (offer v3). Three ways in, most done-for-you first:
// Founding partner (live spots count) -> Regulars Engine -> Own it (one-time
// packs, opens the existing plan popup). Then the guarantee, a preview of the
// client dashboard they get, and the honest comparison with Owner.com/Popmenu.
// The free mockup + bag card stays the no-risk door.

const R = REGULARS;
const lowest = Math.min(...PACKAGES.map((p) => p.price));

const INCLUDED = [
  "Your own ordering site + phone app, with your menu and photos",
  "Bag cards for every delivery and takeout bag, designed for you",
  "A text club: sign-up at the counter, tables and checkout",
  `${R.textCampaignsPerMonth} texts a month to your regulars, written and sent by me`,
  "Your Google listing fixed so \"Order\" goes to you",
  "A Google review ask after every order",
  "Every order rings your phone and a kitchen screen",
  "Your own Starvega account: see everything I do, your bills, ask for changes",
];

export default async function Offer() {
  const spots = await foundingSpotsLeft();
  return (
    <section id="plans" className="bg-ink px-4 py-20 text-bg sm:px-10 sm:py-28">
      <div id="offer" className="mx-auto w-full max-w-6xl">
        <p data-reveal className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-amber">Plans</p>
        <h2 data-reveal className="max-w-3xl text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
          Pick how much I do for you.
        </h2>
        <p data-reveal className="mt-4 max-w-2xl text-lg text-white/70">
          Month to month, no contract. Or pay once and run it yourself. No commission on any plan, ever.
        </p>

        <div data-reveal-stagger className="mt-12 grid gap-4 lg:grid-cols-3">
          {/* Founding */}
          <div className="relative flex flex-col rounded-3xl border-2 border-amber bg-white/[0.05] p-6 sm:p-7">
            <span className="absolute -top-3 left-6 rounded-full bg-amber px-3 py-1 text-xs font-bold text-ink">
              {spots > 0 ? `${spots} of ${R.foundingSpots} spots left` : "All spots taken"}
            </span>
            <p className="text-white/70">Founding partner</p>
            <p className="mt-2 text-5xl font-semibold tracking-tight">
              {formatUsd(R.foundingMonthly)}<span className="text-lg text-white/60">/mo</span>
            </p>
            <p className="mt-1 text-sm font-medium text-gain-bright">$0 setup · price locked for life</p>
            <p className="mt-5 flex-1 text-[15px] leading-relaxed text-white/75">
              Everything in the Regulars Engine for the first {R.foundingSpots} restaurants. In return: a short video once you see results, and ok to share your numbers.
            </p>
            {spots > 0 ? (
              <Link href="/start?plan=founding" className="mt-6 rounded-full bg-amber py-3.5 text-center font-semibold text-ink transition-colors hover:bg-amber-deep">
                Claim a founding spot
              </Link>
            ) : (
              <span className="mt-6 rounded-full border border-white/20 py-3.5 text-center text-white/50">Taken</span>
            )}
          </div>

          {/* Regulars Engine */}
          <div className="flex flex-col rounded-3xl border border-white/15 bg-white/[0.03] p-6 sm:p-7">
            <p className="text-white/70">{R.name}</p>
            <p className="mt-2 text-5xl font-semibold tracking-tight">
              {formatUsd(R.monthly)}<span className="text-lg text-white/60">/mo</span>
            </p>
            <p className="mt-1 text-sm text-white/60">{formatUsd(R.setup)} setup · month to month</p>
            <p className="mt-5 flex-1 text-[15px] leading-relaxed text-white/75">
              Done for you, every month. I bring your app customers back as regulars, and fill your slow nights. With the {R.guaranteeOrders}-order guarantee.
            </p>
            <Link href="/start?plan=regulars" className="mt-6 rounded-full bg-white py-3.5 text-center font-semibold text-ink transition-colors hover:bg-white/90">
              Start the {R.name}
            </Link>
          </div>

          {/* Own it */}
          <div className="flex flex-col rounded-3xl border border-white/15 p-6 sm:p-7">
            <p className="text-white/70">Own it</p>
            <p className="mt-2 text-5xl font-semibold tracking-tight">from {formatUsd(lowest)}</p>
            <p className="mt-1 text-sm text-white/60">paid once · first year of care free, then $39/mo</p>
            <p className="mt-5 flex-1 text-[15px] leading-relaxed text-white/75">
              Rather run it yourself? Get the site and ordering, pay once. Add the loyalty club any time. No bag cards or texts done for you.
            </p>
            <ChoosePlanButton variant="outlineOnInk" className="mt-6 w-full">
              See the one-time plans
            </ChoosePlanButton>
          </div>
        </div>

        {/* What's included + dashboard preview */}
        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">Everything in the {R.name}</h3>
            <ul data-reveal-stagger className="mt-6 space-y-3.5">
              {INCLUDED.map((p) => (
                <li key={p} className="flex gap-3 text-[17px] leading-snug text-white/90">
                  <span aria-hidden className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gain-bright text-xs font-bold text-ink">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* A look at the client dashboard (/account), drawn in HTML */}
          <div data-reveal className="rounded-3xl bg-[#f6f6f5] p-4 text-ink shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)] sm:p-5">
            <div className="flex items-center gap-1.5 pb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-3 rounded-md bg-white px-2 py-0.5 text-[11px] text-ink-soft">starvega.site/account</span>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">Your Starvega account</p>
            <p className="text-xl font-semibold">Your Restaurant</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
              <div className="rounded-xl bg-white p-2.5"><p className="text-ink-soft">Website</p><p className="mt-1 font-semibold text-gain">● Live</p></div>
              <div className="rounded-xl bg-white p-2.5"><p className="text-ink-soft">Plan</p><p className="mt-1 font-semibold">{formatUsd(R.monthly)}/mo</p></div>
              <div className="rounded-xl bg-white p-2.5">
                <p className="text-ink-soft">Guarantee</p>
                <p className="mt-1 font-semibold">64 / {R.guaranteeOrders}</p>
                <div className="mt-1 h-1.5 rounded-full bg-paper"><div className="h-full w-[64%] rounded-full bg-gain" /></div>
              </div>
            </div>
            <p className="mt-4 text-[12px] font-semibold">What I did for you</p>
            <ul className="mt-2 space-y-2 text-[12px]">
              {[
                ["💬", "Tuesday special texted to your regulars", "Orders it brought back show here"],
                ["🛍", "Bag cards designed, ready to print", "Code DIRECT"],
                ["⭐", "Google listing: Order button now goes to your site", ""],
                ["📈", "Monthly report", "Direct orders, texts sent, codes used"],
              ].map(([i, t, m]) => (
                <li key={t} className="flex gap-2 rounded-xl bg-white p-2.5">
                  <span>{i}</span>
                  <span>
                    <span className="block font-medium">{t}</span>
                    {m && <span className="text-gain">{m}</span>}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-center text-[10px] text-ink-soft">What your account looks like. The numbers are an example.</p>
          </div>
        </div>

        {/* Guarantee */}
        <div data-reveal className="mt-16 grid gap-6 rounded-3xl border-2 border-gain-bright/50 bg-gain-bright/[0.06] p-7 sm:p-10 lg:grid-cols-[auto_1fr] lg:items-center">
          <div className="grid h-28 w-28 place-items-center rounded-full border-4 border-gain-bright text-center">
            <span className="text-3xl font-bold leading-none">{R.guaranteeOrders}<span className="block text-xs font-medium uppercase tracking-wider text-white/70">orders</span></span>
          </div>
          <div>
            <h3 className="text-[clamp(1.6rem,4vw,2.4rem)] font-semibold tracking-tight">{R.guaranteeOrders} direct orders in {R.guaranteeDays} days, or it&apos;s free.</h3>
            <p className="mt-3 max-w-2xl text-lg text-white/75">
              If your site doesn&apos;t bring you {R.guaranteeOrders} direct orders in your first {R.guaranteeDays} days live, I refund your setup and keep working for free until it does.
            </p>
            <p className="mt-2 text-sm text-white/55">Your part: a card in every delivery and takeout bag, the QR on your counter, and an ok on each text within a day.</p>
          </div>
        </div>

        {/* Compare */}
        <div data-reveal className="mt-16 overflow-x-auto rounded-3xl border border-white/15">
          <table className="w-full min-w-[40rem] text-left text-[15px]">
            <thead className="bg-white/[0.04] text-sm text-white/60">
              <tr>
                <th className="p-4 font-medium"></th>
                <th className="p-4 font-medium">Monthly</th>
                <th className="p-4 font-medium">Who writes your texts</th>
                <th className="p-4 font-medium">Bag cards</th>
                <th className="p-4 font-medium">After launch</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-white/10">
                <td className="p-4">Owner.com</td><td className="p-4 tabular-nums">$499</td><td className="p-4 text-white/60">You (automatic tools)</td><td className="p-4 text-white/60">No</td><td className="p-4 text-white/60">Support team</td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="p-4">Popmenu</td><td className="p-4 tabular-nums">$179 - $499</td><td className="p-4 text-white/60">You (tools)</td><td className="p-4 text-white/60">No</td><td className="p-4 text-white/60">Support team</td>
              </tr>
              <tr className="border-t border-white/10 bg-gain-bright/[0.07]">
                <td className="p-4 font-semibold">Starvega</td><td className="p-4 font-semibold tabular-nums">{formatUsd(R.monthly)}</td><td className="p-4 font-medium">Me, for you</td><td className="p-4 font-medium">Yes</td><td className="p-4 font-medium">Same person, every month</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-white/45">Published prices from owner.com/pricing and Popmenu&apos;s pricing page, November 2026.</p>

        <div data-reveal className="mt-12 flex flex-col items-start gap-3 rounded-2xl bg-white p-6 text-ink sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-xl font-semibold tracking-tight">Not sure yet? See yours first.</p>
            <p className="mt-1 text-ink-soft">Free bag card + a sample of your site, with your name and menu. Within 24 hours.</p>
          </div>
          <WidgetCtaButton entryPoint="offer" className="w-full shrink-0 sm:w-auto">
            Get my free mockup
          </WidgetCtaButton>
        </div>
      </div>
    </section>
  );
}
