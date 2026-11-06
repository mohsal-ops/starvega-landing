import { PLANS, isPlanKey, LIVE_STATUSES } from "@/lib/billing";
import { REGULARS } from "@/lib/pricing";
import { SITE } from "@/lib/site";
import { signOut } from "./_actions";
import { RequestBox, CancelPlan } from "./AccountClient";

// The client dashboard's look, without any data loading: /account passes the
// signed-in restaurant's real data, /account/demo passes a sample (demo = true
// swaps the buttons that would change anything for harmless stand-ins).

export type ViewAccount = {
  restaurantName: string;
  email: string;
  siteUrl: string | null;
  siteStatus: string;
  directOrders: number;
  guaranteeStart: Date | null;
  bagCardCode: string | null;
};
export type ViewSub = { id: string; plan: string; status: string; monthlyCents: number; nextBillingAt: Date | null; startedAt: Date };
export type ViewInvoice = { id: string; amountCents: number; description: string; paidAt: Date };
export type ViewUpdate = { id: string; kind: string; title: string; body: string | null; metric: string | null; createdAt: Date };
export type ViewRequest = { id: string; message: string; status: string; reply: string | null };

const SITE_STEPS = [
  { key: "onboarding", label: "Your basics" },
  { key: "building", label: "Building" },
  { key: "review", label: "Your review" },
  { key: "live", label: "Live" },
];
const KIND: Record<string, { icon: string; tone: string }> = {
  campaign: { icon: "💬", tone: "bg-sky-50" },
  report: { icon: "📈", tone: "bg-emerald-50" },
  site: { icon: "🛠", tone: "bg-stone-100" },
  card: { icon: "🛍", tone: "bg-amber-50" },
  google: { icon: "⭐", tone: "bg-yellow-50" },
  note: { icon: "✉️", tone: "bg-stone-100" },
};
const STATUS: Record<string, { label: string; tone: string }> = {
  active: { label: "Active", tone: "bg-emerald-100 text-emerald-800" },
  approved: { label: "Starting", tone: "bg-emerald-100 text-emerald-800" },
  approval_pending: { label: "Waiting for PayPal", tone: "bg-amber-100 text-amber-800" },
  suspended: { label: "Paused: payment failed", tone: "bg-red-100 text-red-700" },
  cancelled: { label: "Cancelled", tone: "bg-stone-200 text-stone-700" },
  expired: { label: "Ended", tone: "bg-stone-200 text-stone-700" },
};
const money = (c: number) => `$${(c / 100).toFixed(2)}`;
const day = (d: Date | null | undefined) => (d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-");

export function AccountView({
  account,
  subs,
  invoices,
  updates,
  requests,
  lead,
  welcome,
  demo = false,
}: {
  account: ViewAccount;
  subs: ViewSub[];
  invoices: ViewInvoice[];
  updates: ViewUpdate[];
  requests: ViewRequest[];
  lead: { id: string; onboarding: unknown } | null;
  welcome?: boolean;
  demo?: boolean;
}) {
  const sub = subs.find((s) => LIVE_STATUSES.includes(s.status) || s.status === "suspended") ?? subs[0] ?? null;
  const plan = sub && isPlanKey(sub.plan) ? PLANS[sub.plan] : null;
  const stepIdx = Math.max(0, SITE_STEPS.findIndex((s) => s.key === account.siteStatus));
  const needsBasics = !!lead && !lead.onboarding;
  const guaranteeDaysLeft = account.guaranteeStart
    ? Math.max(0, REGULARS.guaranteeDays - Math.floor((Date.now() - account.guaranteeStart.getTime()) / 86400_000))
    : null;
  const pct = Math.min(100, Math.round((account.directOrders / REGULARS.guaranteeOrders) * 100));
  const card = "rounded-3xl border border-line bg-bg p-6";

  return (
    <main className="min-h-screen bg-paper px-4 pb-20 pt-24 sm:px-8 sm:pt-28">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">Your Starvega account</p>
            <h1 className="mt-2 text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-tight text-ink">{account.restaurantName}</h1>
            <p className="text-sm text-ink-soft">Signed in as {account.email}</p>
          </div>
          {demo ? (
            <a href="/start" className="rounded-full bg-amber px-4 py-2 text-sm font-semibold text-ink">Get your own account</a>
          ) : (
            <form action={signOut}>
              <button className="rounded-full border border-line bg-bg px-4 py-2 text-sm hover:border-ink">Sign out</button>
            </form>
          )}
        </header>

        {demo && (
          <div className="mt-6 rounded-3xl border-2 border-dashed border-amber bg-amber/10 p-5 text-ink">
            <p className="font-semibold">This is a sample account.</p>
            <p className="text-sm text-ink-soft">It shows what a restaurant on the Regulars Engine sees after two months. The restaurant and numbers are an example.</p>
          </div>
        )}
        {welcome && (
          <div className="mt-6 rounded-3xl bg-ink p-6 text-bg">
            <p className="text-xl font-semibold">Welcome aboard! 🎉</p>
            <p className="mt-1 text-white/75">Your plan is active and I&apos;ve been notified. Send me your basics below and I&apos;ll start building.</p>
          </div>
        )}

        {needsBasics && (
          <a href={`/onboard/paid/${lead!.id}`} className="mt-6 flex items-center justify-between gap-4 rounded-3xl border-2 border-amber bg-amber/10 p-6 transition-colors hover:bg-amber/20">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-deep">Next step</p>
              <p className="mt-1 text-xl font-semibold text-ink">Send me your basics</p>
              <p className="text-ink-soft">Menu, photos, hours and a line about your story. About 10 minutes, phone photos are fine.</p>
            </div>
            <span className="shrink-0 text-2xl">→</span>
          </a>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {/* Website */}
          <section className={card}>
            <p className="text-sm text-ink-soft">Your website</p>
            <ol className="mt-4 space-y-2.5">
              {SITE_STEPS.map((s, i) => (
                <li key={s.key} className="flex items-center gap-3 text-[15px]">
                  <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${i < stepIdx || account.siteStatus === "live" ? "bg-gain text-white" : i === stepIdx ? "bg-amber text-ink" : "bg-paper text-ink-soft"}`}>
                    {i < stepIdx || account.siteStatus === "live" ? "✓" : i + 1}
                  </span>
                  <span className={i === stepIdx ? "font-semibold text-ink" : "text-ink-soft"}>{s.label}</span>
                </li>
              ))}
            </ol>
            {account.siteUrl && (
              <a href={account.siteUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bg">
                Open your site ↗
              </a>
            )}
            {account.siteUrl && account.siteStatus === "live" && (
              <a href={`${account.siteUrl.replace(/\/$/, "")}/admin`} target="_blank" rel="noreferrer" className="ml-2 mt-5 inline-flex rounded-full border border-line px-4 py-2 text-sm">
                Orders dashboard ↗
              </a>
            )}
          </section>

          {/* Plan */}
          <section className={card}>
            <p className="text-sm text-ink-soft">Your plan</p>
            {sub && plan ? (
              <>
                <p className="mt-2 text-2xl font-semibold tracking-tight">{plan.name}</p>
                <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS[sub.status]?.tone ?? "bg-stone-100"}`}>{STATUS[sub.status]?.label ?? sub.status}</span>
                <dl className="mt-4 space-y-1.5 text-[15px]">
                  <div className="flex justify-between"><dt className="text-ink-soft">Monthly</dt><dd className="font-medium">{money(sub.monthlyCents)}</dd></div>
                  {LIVE_STATUSES.includes(sub.status) && <div className="flex justify-between"><dt className="text-ink-soft">Next charge</dt><dd className="font-medium">{day(sub.nextBillingAt)}</dd></div>}
                  <div className="flex justify-between"><dt className="text-ink-soft">Member since</dt><dd>{day(sub.startedAt)}</dd></div>
                </dl>
                {sub.status === "suspended" && (
                  <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">PayPal couldn&apos;t charge your card. Update it in PayPal and the plan starts again.</p>
                )}
              </>
            ) : (
              <p className="mt-2 text-ink-soft">No plan yet.</p>
            )}
          </section>

          {/* Guarantee */}
          <section className={card}>
            <p className="text-sm text-ink-soft">Your guarantee</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {account.directOrders} <span className="text-base font-normal text-ink-soft">of {REGULARS.guaranteeOrders} direct orders</span>
            </p>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-paper">
              <div className="h-full rounded-full bg-gain transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-3 text-sm text-ink-soft">
              {account.directOrders >= REGULARS.guaranteeOrders
                ? "Done! You hit the goal."
                : guaranteeDaysLeft != null
                  ? `${guaranteeDaysLeft} days left. If we miss it, your setup comes back and I keep working free.`
                  : `The ${REGULARS.guaranteeDays} days start the day your site goes live.`}
            </p>
            {account.bagCardCode && (
              <p className="mt-3 rounded-xl bg-paper p-3 text-sm">
                Your bag card code: <span className="font-mono font-semibold">{account.bagCardCode}</span>
              </p>
            )}
          </section>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          {/* Timeline */}
          <section className={card}>
            <h2 className="text-lg font-semibold">What I did for you</h2>
            {updates.length === 0 ? (
              <p className="mt-3 text-ink-soft">Nothing yet. Every text I send, report and change shows up here.</p>
            ) : (
              <ol className="mt-4 space-y-3">
                {updates.map((u) => {
                  const k = KIND[u.kind] ?? KIND.note;
                  return (
                    <li key={u.id} className="flex gap-3">
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-lg ${k.tone}`}>{k.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="font-medium text-ink">{u.title}</p>
                          <span className="text-xs text-ink-soft">{day(u.createdAt)}</span>
                        </div>
                        {u.metric && <p className="text-sm font-semibold text-gain">{u.metric}</p>}
                        {u.body && <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">{u.body}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <div className="space-y-4">
            <section className={card}>
              <h2 className="text-lg font-semibold">Ask for a change</h2>
              <p className="mt-1 text-sm text-ink-soft">New dish, price change, a special to text out. I&apos;ll take care of it.</p>
              {demo ? <p className="mt-3 rounded-2xl border border-dashed border-line p-3 text-sm text-ink-soft">A box here lets you send a request any time.</p> : <RequestBox />}
              {requests.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {requests.map((r) => (
                    <li key={r.id} className="rounded-2xl bg-paper p-3 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-ink">{r.message}</p>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${r.status === "done" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                          {r.status === "done" ? "Done" : "Open"}
                        </span>
                      </div>
                      {r.reply && <p className="mt-1.5 text-ink-soft">↳ {r.reply}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className={card}>
              <h2 className="text-lg font-semibold">Billing</h2>
              {invoices.length === 0 ? (
                <p className="mt-2 text-sm text-ink-soft">Your receipts show up here after each payment.</p>
              ) : (
                <ul className="mt-3 divide-y divide-line text-sm">
                  {invoices.map((i) => (
                    <li key={i.id} className="flex justify-between gap-2 py-2">
                      <span className="text-ink-soft">{day(i.paidAt)} · {i.description}</span>
                      <span className="font-medium tabular-nums">{money(i.amountCents)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <a href="https://www.paypal.com/myaccount/autopay/" target="_blank" rel="noreferrer" className="rounded-full border border-line px-4 py-2 text-sm hover:border-ink">
                  Change card in PayPal ↗
                </a>
                {!demo && sub && (LIVE_STATUSES.includes(sub.status) || sub.status === "suspended") && <CancelPlan subscriptionId={sub.id} />}
              </div>
            </section>

            <section className={card}>
              <h2 className="text-lg font-semibold">Need me?</h2>
              <p className="mt-1 text-sm text-ink-soft">Same person who built your site, every month.</p>
              <a href={`mailto:${SITE.contactEmail}?subject=${encodeURIComponent(account.restaurantName)}`} className="mt-3 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bg">
                Email Ben
              </a>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
