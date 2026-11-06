"use client";

import { useState, useTransition } from "react";
import { addUpdate, updateAccount, answerRequest, addClientByHand, refreshBilling } from "./_actions";

export type ClientRow = {
  id: string; email: string; restaurantName: string; ownerName: string | null; phone: string | null; city: string | null;
  siteUrl: string | null; siteStatus: string; builderSlug: string | null; directOrders: number; guaranteeStart: string | null;
  bagCardCode: string | null; notes: string | null; leadId: string | null; lastLoginAt: string | null;
  plan: string | null; planStatus: string | null; monthly: number | null; nextBillingAt: string | null; failedPayments: number; paypalId: string | null;
  requests: { id: string; message: string; status: string; reply: string | null; createdAt: string }[];
  updates: { id: string; kind: string; title: string; createdAt: string }[];
  lastInvoice: { amount: number; paidAt: string } | null;
};

const input = "rounded-lg border border-line bg-bg px-2.5 py-1.5 text-sm";
const d = (s: string | null) => (s ? new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "-");
const TONE: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800", approved: "bg-emerald-100 text-emerald-800", suspended: "bg-red-100 text-red-700",
  cancelled: "bg-stone-200 text-stone-700", expired: "bg-stone-200 text-stone-700",
};

export function ClientCard({ c }: { c: ClientRow }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const [u, setU] = useState({ kind: "campaign", title: "", body: "", metric: "", notify: true });
  const [f, setF] = useState({
    siteStatus: c.siteStatus, siteUrl: c.siteUrl ?? "", builderSlug: c.builderSlug ?? "", directOrders: String(c.directOrders),
    bagCardCode: c.bagCardCode ?? "", notes: c.notes ?? "",
  });
  const openReq = c.requests.filter((r) => r.status === "open");

  return (
    <div className="rounded-2xl border border-line bg-bg">
      <button onClick={() => setOpen(!open)} className="flex w-full flex-wrap items-center gap-3 p-4 text-left">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{c.restaurantName}</p>
          <p className="truncate text-xs text-ink-soft">{c.ownerName ?? ""} · {c.email}{c.phone ? ` · ${c.phone}` : ""}{c.city ? ` · ${c.city}` : ""}</p>
        </div>
        {c.plan && <span className="text-sm">{c.plan} · ${c.monthly}/mo</span>}
        {c.planStatus && <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONE[c.planStatus] ?? "bg-stone-100"}`}>{c.planStatus}</span>}
        <span className="rounded-full bg-paper px-2 py-0.5 text-xs">site: {c.siteStatus}</span>
        <span className="text-xs text-ink-soft">{c.directOrders} orders</span>
        {openReq.length > 0 && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">{openReq.length} request{openReq.length === 1 ? "" : "s"}</span>}
        <span className="text-ink-soft">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="grid gap-5 border-t border-line p-4 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">Post an update (shows on their dashboard)</p>
              <div className="grid gap-2">
                <div className="flex gap-2">
                  <select value={u.kind} onChange={(e) => setU({ ...u, kind: e.target.value })} className={input}>
                    <option value="campaign">💬 Text campaign</option>
                    <option value="report">📈 Monthly report</option>
                    <option value="site">🛠 Site change</option>
                    <option value="card">🛍 Bag cards</option>
                    <option value="google">⭐ Google listing</option>
                    <option value="note">✉️ Note</option>
                  </select>
                  <input value={u.metric} onChange={(e) => setU({ ...u, metric: e.target.value })} placeholder="Number, e.g. 312 texts · 41 orders" className={`${input} flex-1`} />
                </div>
                <input value={u.title} onChange={(e) => setU({ ...u, title: e.target.value })} placeholder="Title, e.g. Tuesday special texted to your club" className={input} />
                <textarea value={u.body} onChange={(e) => setU({ ...u, body: e.target.value })} rows={3} placeholder="Details (optional)" className={input} />
                <label className="flex items-center gap-2 text-sm text-ink-soft">
                  <input type="checkbox" checked={u.notify} onChange={(e) => setU({ ...u, notify: e.target.checked })} /> Email it to them too
                </label>
                <button
                  disabled={pending || !u.title.trim()}
                  onClick={() => start(async () => {
                    const r = await addUpdate({ accountId: c.id, ...u });
                    setMsg(r.ok ? "Posted." : r.error);
                    if (r.ok) setU({ ...u, title: "", body: "", metric: "" });
                  })}
                  className="w-fit rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-bg disabled:opacity-50"
                >
                  Post update
                </button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">Change requests</p>
              {c.requests.length === 0 ? <p className="text-sm text-ink-soft">None.</p> : c.requests.map((r) => <RequestRow key={r.id} r={r} />)}
            </div>

            {c.updates.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">Recent updates</p>
                <ul className="text-sm text-ink-soft">
                  {c.updates.map((x) => <li key={x.id}>{d(x.createdAt)} · {x.title}</li>)}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Site & guarantee</p>
            <div className="grid grid-cols-2 gap-2">
              <select value={f.siteStatus} onChange={(e) => setF({ ...f, siteStatus: e.target.value })} className={input}>
                <option value="onboarding">Waiting for basics</option>
                <option value="building">Building</option>
                <option value="review">Their review</option>
                <option value="live">Live (starts the 90 days)</option>
              </select>
              <input value={f.directOrders} onChange={(e) => setF({ ...f, directOrders: e.target.value.replace(/\D/g, "") })} placeholder="Direct orders so far" className={input} />
              <input value={f.siteUrl} onChange={(e) => setF({ ...f, siteUrl: e.target.value })} placeholder="Site URL" className={`${input} col-span-2`} />
              <input value={f.builderSlug} onChange={(e) => setF({ ...f, builderSlug: e.target.value })} placeholder="Builder project slug" className={input} />
              <input value={f.bagCardCode} onChange={(e) => setF({ ...f, bagCardCode: e.target.value.toUpperCase() })} placeholder="Bag card code" className={input} />
              <textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} rows={2} placeholder="Private notes" className={`${input} col-span-2`} />
            </div>
            <button
              disabled={pending}
              onClick={() => start(async () => {
                await updateAccount(c.id, { ...f, directOrders: Number(f.directOrders || 0) });
                setMsg("Saved.");
              })}
              className="rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-bg disabled:opacity-50"
            >
              Save
            </button>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-xl bg-paper p-3 text-sm">
              <dt className="text-ink-soft">Next charge</dt><dd>{d(c.nextBillingAt)}</dd>
              <dt className="text-ink-soft">Last payment</dt><dd>{c.lastInvoice ? `$${c.lastInvoice.amount} · ${d(c.lastInvoice.paidAt)}` : "-"}</dd>
              <dt className="text-ink-soft">Failed payments</dt><dd>{c.failedPayments}</dd>
              <dt className="text-ink-soft">90 days started</dt><dd>{d(c.guaranteeStart)}</dd>
              <dt className="text-ink-soft">Last sign-in</dt><dd>{d(c.lastLoginAt)}</dd>
              <dt className="text-ink-soft">PayPal</dt><dd className="truncate font-mono text-xs">{c.paypalId ?? "-"}</dd>
            </dl>
            {c.leadId && <a href={`/onboard/paid/${c.leadId}`} target="_blank" rel="noreferrer" className="text-sm underline">Their onboarding form ↗</a>}
          </div>
          {msg && <p className="text-sm text-gain lg:col-span-2">{msg}</p>}
        </div>
      )}
    </div>
  );
}

function RequestRow({ r }: { r: ClientRow["requests"][number] }) {
  const [reply, setReply] = useState(r.reply ?? "");
  const [pending, start] = useTransition();
  return (
    <div className="mb-2 rounded-xl bg-paper p-3 text-sm">
      <div className="flex justify-between gap-2">
        <p className="text-ink">{r.message}</p>
        <span className="shrink-0 text-xs text-ink-soft">{d(r.createdAt)} · {r.status}</span>
      </div>
      <div className="mt-2 flex gap-2">
        <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply (emailed + shown)" className={`${input} flex-1`} />
        <button disabled={pending} onClick={() => start(async () => { await answerRequest(r.id, reply, true); })} className="rounded-lg bg-ink px-2.5 text-xs font-medium text-bg">
          Done
        </button>
      </div>
    </div>
  );
}

export function AddClient() {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState({ email: "", restaurantName: "", ownerName: "", phone: "", siteUrl: "" });
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  if (!open) return <button onClick={() => setOpen(true)} className="rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-bg">Add client by hand</button>;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md space-y-2 rounded-2xl bg-bg p-5">
        <p className="font-semibold">Add a client by hand</p>
        <p className="text-sm text-ink-soft">For restaurants that pay you some other way. They can sign in with this email.</p>
        {(["restaurantName", "email", "ownerName", "phone", "siteUrl"] as const).map((k) => (
          <input key={k} value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} placeholder={{ restaurantName: "Restaurant name", email: "Email", ownerName: "Owner name", phone: "Phone", siteUrl: "Site URL (if live)" }[k]} className={`${input} w-full`} />
        ))}
        {err && <p className="text-sm text-red-600">{err}</p>}
        <div className="flex gap-2">
          <button disabled={pending} onClick={() => start(async () => { const r = await addClientByHand(v); if (r.ok) setOpen(false); else setErr(r.error); })} className="rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-bg">Add</button>
          <button onClick={() => setOpen(false)} className="rounded-lg border border-line px-3 py-1.5 text-sm">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function RefreshBilling() {
  const [pending, start] = useTransition();
  const [n, setN] = useState<number | null>(null);
  return (
    <button disabled={pending} onClick={() => start(async () => { const r = await refreshBilling(); setN(r.count); })} className="rounded-lg border border-line bg-bg px-3 py-1.5 text-sm">
      {pending ? "Checking PayPal…" : n != null ? `Synced ${n}` : "Sync with PayPal"}
    </button>
  );
}
