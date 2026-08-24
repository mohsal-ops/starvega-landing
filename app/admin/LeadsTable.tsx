"use client";

import { useState } from "react";

export type Lead = {
  id: string;
  businessName: string;
  businessType: string | null;
  contact: string | null;
  country: string | null;
  city: string | null;
  status: string;
  photoUrls: string[];
  createdAt: string;
};

const STATUSES = ["new", "reviewed", "contacted", "converted"];
const STATUS_CLASS: Record<string, string> = {
  new: "bg-amber/15 text-amber-deep",
  reviewed: "bg-blue-100 text-blue-700",
  contacted: "bg-violet-100 text-violet-700",
  converted: "bg-green-100 text-green-700",
};

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const [rows, setRows] = useState(leads);
  const [busy, setBusy] = useState<string | null>(null);

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
    if (!confirm("Delete this lead? This can't be undone.")) return;
    setBusy(id);
    setRows((r) => r.filter((x) => x.id !== id));
    try {
      await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
    } finally {
      setBusy(null);
    }
  };

  if (rows.length === 0) return <p className="text-sm text-ink-soft">No leads yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-line text-left font-mono text-[11px] uppercase tracking-wider text-ink-soft">
            <th className="py-2 pr-3 font-medium">Business</th>
            <th className="py-2 pr-3 font-medium">Type</th>
            <th className="py-2 pr-3 font-medium">Contact</th>
            <th className="py-2 pr-3 font-medium">Location</th>
            <th className="py-2 pr-3 font-medium">Photos</th>
            <th className="py-2 pr-3 font-medium">When</th>
            <th className="py-2 pr-3 font-medium">Status</th>
            <th className="py-2 font-medium sr-only">Delete</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((l) => (
            <tr key={l.id} className="border-b border-line/60">
              <td className="py-3 pr-3 font-medium text-ink">{l.businessName}</td>
              <td className="py-3 pr-3 text-ink-soft">{l.businessType || "-"}</td>
              <td className="py-3 pr-3 text-ink-soft">{l.contact || "-"}</td>
              <td className="py-3 pr-3 text-ink-soft">{[l.city, l.country].filter(Boolean).join(", ") || "-"}</td>
              <td className="py-3 pr-3">
                {l.photoUrls[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.photoUrls[0]} alt="" className="h-9 w-9 rounded object-cover" />
                ) : (
                  <span className="text-ink-soft">-</span>
                )}
              </td>
              <td className="py-3 pr-3 whitespace-nowrap text-ink-soft">{new Date(l.createdAt).toLocaleDateString()}</td>
              <td className="py-3">
                <select
                  value={l.status}
                  disabled={busy === l.id}
                  onChange={(e) => setStatus(l.id, e.target.value)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[l.status] || "bg-stone-100 text-stone-600"}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
              <td className="py-3 pl-1">
                <button
                  onClick={() => del(l.id)}
                  disabled={busy === l.id}
                  aria-label="Delete lead"
                  title="Delete lead"
                  className="grid h-7 w-7 place-items-center rounded-md text-ink-soft transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
