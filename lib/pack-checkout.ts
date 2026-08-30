"use client";

import { sessionId } from "@/lib/track-client";
import type { PackTier } from "@/lib/pricing";

// Choose a pack -> create the lead + fire the owner notification server-side,
// then go straight to that pack's checkout. The amount is decided server-side
// from the tier; nothing price-related is trusted from the client.
export async function startPackCheckout(
  tier: PackTier,
  extra?: { businessName?: string; contact?: string },
): Promise<void> {
  const res = await fetch("/api/pack-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tier, sessionId: sessionId(), ...extra }),
  });
  const data = (await res.json().catch(() => ({}))) as { leadId?: string; error?: string };
  if (!res.ok || !data.leadId) throw new Error(data.error || "Could not start checkout.");
  window.location.href = `/checkout/${data.leadId}`;
}
