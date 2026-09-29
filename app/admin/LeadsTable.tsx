"use client";

import { useState } from "react";
import { useConfirm } from "./useConfirm";
import { timeAgo } from "./format";

export type Lead = {
  id: string;
  businessName: string;
  businessType: string | null;
  ownerName: string | null;
  contact: string | null;
  email: string | null;
  source: string | null;
  country: string | null;
  city: string | null;
  status: string;
  packTier: string | null;
  paymentStatus: string;
  createdAt: string;
};

const STATUSES = ["new", "reviewed", "contacted", "converted"];
const STATUS_CLASS: Record<string, string> = {
  new: "bg-amber/15 text-amber-deep",
  reviewed: "bg-blue-100 text-blue-700",
  contacted: "bg-violet-100 text-violet-700",
  converted: "bg-green-100 text-green-700",
};

// wa.me wants digits only, country code included (no +, spaces or dashes).
const waLink = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "")}`;

// The leads inbox - the thing to act on daily, so it sits at the top of /admin.
// Every lead shows who, which restaurant, and one-tap WhatsApp / call / email.
export function LeadsTable({ leads }: { leads: Lead[] }) {
  const [rows, setRows] = useState(leads);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirm, confirmDialog] = useConfirm();

  const setStatus = async (id: string, status: string) => {
    setBusy(id);
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    try {
      await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } finally {
      setBusy(null);
    }
  };

  const del = async (id: string) => {
    if (!(await confirm({ title: "Delete this lead?", description: "This can't be undone.", confirmText: "Delete", destructive: true }))) return;
    setBusy(id);
    setRows((r) => r.filter((x) => x.id !== id));
    try {
      await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
    } finally {
      setBusy(null);
    }
  };

  if (rows.length === 0) {
    return <p className="text-sm text-ink-soft">No leads in this range yet. New mockup requests land here (and in your email).</p>;
  }

  const chip = "inline-flex min-h-[32px] items-center rounded-full border border-line px-3 text-xs font-medium text-ink hover:border-ink";

  return (
    <>
      <ul className="divide-y divide-line">
        {rows.map((l) => {
          const isNew = l.status === "new";
          return (
            <li key={l.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-ink">
                  {isNew && <span className="h-2 w-2 shrink-0 rounded-full bg-amber" aria-label="new" />}
                  <span className="truncate">{l.businessName}</span>
                  {l.ownerName && <span className="font-normal text-ink-soft">· {l.ownerName}</span>}
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  {[
                    l.source === "mockup_form" ? "Mockup request" : l.packTier ? `Chose ${l.packTier}` : "Old preview builder",
                    l.paymentStatus === "paid" ? "PAID" : null,
                    [l.city, l.country].filter(Boolean).join(", ") || null,
                    timeAgo(l.createdAt),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {l.contact && (
                    <>
                      <a href={waLink(l.contact)} target="_blank" rel="noopener noreferrer" className={`${chip} border-green-600/40 text-green-700`}>
                        WhatsApp {l.contact}
                      </a>
                      <a href={`tel:${l.contact.replace(/[^\d+]/g, "")}`} className={chip}>
                        Call
                      </a>
                    </>
                  )}
                  {l.email && (
                    <a href={`mailto:${l.email}`} className={chip}>
                      {l.email}
                    </a>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <select
                  value={l.status}
                  disabled={busy === l.id}
                  onChange={(e) => setStatus(l.id, e.target.value)}
                  aria-label="Lead status"
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[l.status] || "bg-stone-100 text-stone-600"}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => del(l.id)}
                  disabled={busy === l.id}
                  aria-label="Delete lead"
                  title="Delete lead"
                  className="grid h-8 w-8 place-items-center rounded-md text-ink-soft transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {confirmDialog}
    </>
  );
}
