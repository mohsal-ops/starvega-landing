import type { Metadata } from "next";
import { AccountView } from "../AccountView";
import { REGULARS } from "@/lib/pricing";

// /account/demo - a public SAMPLE of the client dashboard (no login, no data
// loading, nothing clickable changes anything). Shows a restaurant two months
// into the Regulars Engine, so prospects see exactly what they'd get.
export const metadata: Metadata = {
  title: "Sample client account | Starvega",
  description: "What a restaurant on the Regulars Engine sees in its Starvega account: site, plan, guarantee, every text sent, reports and receipts.",
};

const ago = (days: number) => new Date(Date.now() - days * 86400_000);

export default function AccountDemo() {
  const monthly = REGULARS.monthly * 100;
  return (
    <AccountView
      demo
      account={{
        restaurantName: "Al-Noor Halal Grill",
        email: "yousef@alnoorgrill.com",
        siteUrl: "https://burnin-bird.vercel.app",
        siteStatus: "live",
        directOrders: 64,
        guaranteeStart: ago(49),
        bagCardCode: "DIRECT",
      }}
      subs={[{ id: "demo", plan: "regulars", status: "active", monthlyCents: monthly, nextBillingAt: new Date(Date.now() + 26 * 86400_000), startedAt: ago(63) }]}
      invoices={[
        { id: "i3", amountCents: monthly, description: `${REGULARS.name}: monthly`, paidAt: ago(4) },
        { id: "i2", amountCents: monthly, description: `${REGULARS.name}: monthly`, paidAt: ago(34) },
        { id: "i1", amountCents: monthly + REGULARS.setup * 100, description: `${REGULARS.name}: setup + first month`, paidAt: ago(63) },
      ]}
      updates={[
        { id: "u1", kind: "report", title: "October report", metric: "64 direct orders · $0 in app fees · 212 people in your text club", body: "Best night: Tuesday the 21st, the free fries text. Next month: a catering text to the offices nearby.", createdAt: ago(1) },
        { id: "u2", kind: "campaign", title: "Tuesday special texted to 212 regulars", metric: "19 orders came back that night", body: "\"Al-Noor: Tuesday only, free garlic fries with any order. Tap to order.\"", createdAt: ago(3) },
        { id: "u3", kind: "google", title: "Google listing fixed", metric: "The Order button now goes to your site", body: null, createdAt: ago(9) },
        { id: "u4", kind: "card", title: "500 bag cards designed and sent to print", metric: "Code DIRECT · used on 23 orders so far", body: null, createdAt: ago(40) },
        { id: "u5", kind: "site", title: "Your site is live", metric: null, body: "Menu, photos, pickup and delivery are on. Every order rings your phone and the kitchen tablet.", createdAt: ago(49) },
        { id: "u6", kind: "note", title: `Welcome to Starvega! Your ${REGULARS.name} plan is active.`, metric: null, body: "Next step: send me your basics (menu, photos, hours).", createdAt: ago(63) },
      ]}
      requests={[
        { id: "r2", message: "Can we text a Friday family-platter deal?", status: "open", reply: null },
        { id: "r1", message: "Add the lamb mandi plate at $18.99", status: "done", reply: "Done! It's on the menu with your photo." },
      ]}
      lead={null}
    />
  );
}
