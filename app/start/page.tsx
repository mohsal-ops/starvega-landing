import type { Metadata } from "next";
import Link from "next/link";
import { foundingSpotsLeft } from "@/lib/billing";
import { REGULARS, PACKAGES, formatUsd } from "@/lib/pricing";
import { StartClient } from "./StartClient";

// /start - the monthly sign-up (offer v3). Pick Founding partner or the
// Regulars Engine, type the basics, subscribe with PayPal (card or PayPal).
// On approval the account is created and they land on /account.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Start your plan | Starvega",
  description: "Sign up for the Regulars Engine: your ordering site, bag cards, text club and texts on slow nights, done for you. Month to month.",
  robots: { index: false, follow: true },
};

export default async function StartPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan } = await searchParams;
  const spots = await foundingSpotsLeft();
  const initial = plan === "regulars" || spots === 0 ? "regulars" : "founding";
  const lowestPack = Math.min(...PACKAGES.map((p) => p.price));

  return (
    <main className="min-h-screen bg-paper px-4 pb-20 pt-28 sm:px-10 sm:pt-32">
      <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-amber-deep">Start your plan</p>
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-ink">
            Your regulars, ordering straight from you.
          </h1>
          <ul className="mt-8 space-y-4 text-[16px] leading-snug text-ink">
            {[
              ["Month to month", "No contract. Stop any month from your dashboard."],
              [`${REGULARS.guaranteeOrders} orders or it's free`, `${REGULARS.guaranteeOrders} direct orders in your first ${REGULARS.guaranteeDays} days, or your setup comes back and I keep working free.`],
              ["One person, start to finish", "I build it, I run it, and I answer you. You won't get passed around."],
              ["Your own account", "See your site, what I did each month, your bills, and ask for changes."],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-3">
                <span aria-hidden className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gain text-xs font-bold text-white">✓</span>
                <span>
                  <span className="font-semibold">{t}.</span> <span className="text-ink-soft">{d}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-ink-soft">
            Rather pay once and run it yourself? <Link href="/#plans" className="underline underline-offset-4">Own it from {formatUsd(lowestPack)}</Link>.
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Already a client? <Link href="/account/login" className="underline underline-offset-4">Sign in</Link>.
          </p>
        </div>

        <StartClient
          initialPlan={initial}
          foundingSpots={spots}
          paypalClientId={process.env.NEXT_PAYPAL_CLIENT_ID || ""}
          prices={{
            foundingMonthly: REGULARS.foundingMonthly,
            monthly: REGULARS.monthly,
            setup: REGULARS.setup,
            foundingSpotsTotal: REGULARS.foundingSpots,
          }}
        />
      </div>
    </main>
  );
}
