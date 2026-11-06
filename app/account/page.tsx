import type { Metadata } from "next";
import db from "@/lib/db";
import { requireAccount } from "@/lib/account-auth";
import { syncSubscription } from "@/lib/billing";
import { AccountView } from "./AccountView";

// The restaurant owner's Starvega dashboard: their site, their plan and bills,
// the guarantee, everything done for them, and a way to ask for changes.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your account | Starvega", robots: { index: false, follow: false } };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const account = await requireAccount();
  const { welcome } = await searchParams;

  let subs = await db.subscription.findMany({ where: { accountId: account.id }, orderBy: { startedAt: "desc" } });
  // Keep the plan fresh from PayPal (at most once an hour) even if a webhook was missed.
  await Promise.all(
    subs
      .filter((s) => !["cancelled", "expired"].includes(s.status) && Date.now() - s.updatedAt.getTime() > 3600_000)
      .map((s) => syncSubscription(s).catch(() => null)),
  );
  subs = await db.subscription.findMany({ where: { accountId: account.id }, orderBy: { startedAt: "desc" } });

  const [invoices, updates, requests, lead] = await Promise.all([
    db.invoice.findMany({ where: { accountId: account.id }, orderBy: { paidAt: "desc" }, take: 24 }),
    db.clientUpdate.findMany({ where: { accountId: account.id }, orderBy: { createdAt: "desc" }, take: 40 }),
    db.clientRequest.findMany({ where: { accountId: account.id }, orderBy: { createdAt: "desc" }, take: 20 }),
    account.leadId ? db.instantDemoLead.findUnique({ where: { id: account.leadId }, select: { id: true, onboarding: true } }) : null,
  ]);

  return <AccountView account={account} subs={subs} invoices={invoices} updates={updates} requests={requests} lead={lead} welcome={!!welcome} />;
}
