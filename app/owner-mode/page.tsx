"use client";

import { useEffect, useState } from "react";
import { OWNER_FLAG, setOwnerFlag, clearOwnerFlag, isOwner } from "@/lib/owner";

// PRIVATE, unlinked, noindexed route. Visiting it marks THIS browser as the
// owner so none of your own visits pollute analytics. It sets a long-lived
// `starvega_owner` cookie + localStorage flag; from then on the GA4 loader is
// disabled and /api/track logging is skipped for this browser (see lib/owner.ts).
//
// Not in any nav and blocked in robots.ts - reachable only by typing the URL.
// To undo (e.g. to test tracking), visit /owner-mode?off=1.
export default function OwnerMode() {
  const [state, setState] = useState<"on" | "off" | null>(null);

  useEffect(() => {
    const off = new URLSearchParams(window.location.search).has("off");
    if (off) {
      clearOwnerFlag();
      setState("off");
    } else {
      setOwnerFlag();
      setState("on");
    }
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Owner mode</h1>
      {state === "on" && (
        <p className="text-sm leading-relaxed text-stone-600">
          This browser is now flagged as the owner (<code>{OWNER_FLAG}</code>).
          Your visits will no longer fire GA4 or write to the analytics database.
          Nothing else changes.
        </p>
      )}
      {state === "off" && (
        <p className="text-sm leading-relaxed text-stone-600">
          Owner flag cleared. This browser is tracked normally again.
        </p>
      )}
      {state === null && <p className="text-sm text-stone-500">Applying…</p>}
      <p className="text-xs text-stone-400">
        Currently: {isOwner() ? "owner (excluded)" : "tracked"} · toggle off with{" "}
        <code>/owner-mode?off=1</code>
      </p>
    </main>
  );
}
