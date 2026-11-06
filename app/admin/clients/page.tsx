import type { Metadata } from "next";
import db from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { LIVE_STATUSES, PLANS, isPlanKey, foundingSpotsLeft } from "@/lib/billing";
import { ClientCard, AddClient, RefreshBilling } from "./ClientsClient";

// /admin/clients - Ben's side of the client platform: every paying restaurant,
// its plan + PayPal status, monthly revenue, open change requests, and the tools
// to post what was done for them (shows on their /account dashboard).
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Clients - Starvega admin", robots: { index: false, follow: false } };

export default async function ClientsAdmin() {
  await requireAuth();
  const accounts = await db.account.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscriptions: { orderBy: { startedAt: "desc" } },
      requests: { orderBy: { createdAt: "desc" }, take: 10 },
      updates: { orderBy: { createdAt: "desc" }, take: 5 },
      invoices: { orderBy: { paidAt: "desc" }, take: 3 },
    },
  });
  const spots = await foundingSpotsLeft();

  const live = accounts.flatMap((a) => a.subscriptions.filter((s) => LIVE_STATUSES.includes(s.status)));
  const mrr = live.reduce((s, x) => s + x.monthlyCents, 0) / 100;
  const openReq = accounts.reduce((s, a) => s + a.requests.filter((r) => r.status === "open").length, 0);
  const troubled = accounts.filter((a) => a.subscriptions.some((s) => s.status === "suspended" || s.failedPayments > 0)).length;
  const collected = (await db.invoice.aggregate({ _sum: { amountCents: true } }).catch(() => ({ _sum: { amountCents: 0 } })))._sum.amountCents ?? 0;

  const rows = accounts.map((a) => {
    const sub = a.subscriptions.find((s) => LIVE_STATUSES.includes(s.status) || s.status === "suspended") ?? a.subscriptions[0] ?? null;
    return {
      id: a.id,
      email: a.email,
      restaurantName: a.restaurantName,
      ownerName: a.ownerName,
      phone: a.phone,
      city: a.city,
      siteUrl: a.siteUrl,
      siteStatus: a.siteStatus,
      builderSlug: a.builderSlug,
      directOrders: a.directOrders,
      guaranteeStart: a.guaranteeStart?.toISOString() ?? null,
      bagCardCode: a.bagCardCode,
      notes: a.notes,
      leadId: a.leadId,
      lastLoginAt: a.lastLoginAt?.toISOString() ?? null,
      plan: sub ? (isPlanKey(sub.plan) ? PLANS[sub.plan].name : sub.plan) : null,
      planStatus: sub?.status ?? null,
      monthly: sub ? sub.monthlyCents / 100 : null,
      nextBillingAt: sub?.nextBillingAt?.toISOString() ?? null,
      failedPayments: sub?.failedPayments ?? 0,
      paypalId: sub?.providerSubId ?? null,
      requests: a.requests.map((r) => ({ id: r.id, message: r.message, status: r.status, reply: r.reply, createdAt: r.createdAt.toISOString() })),
      updates: a.updates.map((u) => ({ id: u.id, kind: u.kind, title: u.title, createdAt: u.createdAt.toISOString() })),
      lastInvoice: a.invoices[0] ? { amount: a.invoices[0].amountCents / 100, paidAt: a.invoices[0].paidAt.toISOString() } : null,
    };
  });

  return (
    <main className="min-h-screen bg-paper px-6 py-8 sm:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <a href="/admin" className="text-sm text-ink-soft hover:text-ink">← Analytics</a>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink">Clients</h1>
            <p className="text-sm text-ink-soft">Paying restaurants, their plans, and what you did for them.</p>
          </div>
          <div className="flex gap-2">
            <RefreshBilling />
            <AddClient />
          </div>
        </header>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Monthly revenue", `$${mrr.toLocaleString("en-US")}`],
            ["Paying clients", String(live.length)],
            ["Collected so far", `$${(collected / 100).toLocaleString("en-US")}`],
            ["Open requests", String(openReq)],
            ["Founding spots left", String(spots)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-line bg-bg p-4">
              <p className="text-xs text-ink-soft">{k}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{v}</p>
            </div>
          ))}
        </div>
        {troubled > 0 && (
          <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{troubled} client{troubled === 1 ? "" : "s"} with a failed payment. PayPal retries; check below.</p>
        )}
        {!process.env.PAYPAL_WEBHOOK_ID && (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            PAYPAL_WEBHOOK_ID isn&apos;t set, so monthly receipts aren&apos;t recorded automatically yet. Add the webhook in PayPal (URL /api/billing/webhook) and put its id in Vercel.
          </p>
        )}

        <div className="mt-6 space-y-4">
          {rows.length === 0 ? (
            <p className="rounded-2xl border border-line bg-bg p-8 text-center text-ink-soft">No clients yet. They appear here the moment someone subscribes on /start.</p>
          ) : (
            rows.map((r) => <ClientCard key={r.id} c={r} />)
          )}
        </div>
      </div>
    </main>
  );
}
