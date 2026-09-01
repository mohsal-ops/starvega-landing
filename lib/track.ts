import { isOwner } from "./owner";

// Thin wrapper over GA4's gtag (loaded by @next/third-parties). Every funnel
// event goes through here so tracking is consistent and safe to call anywhere -
// it no-ops on the server and when GA isn't loaded (e.g. no measurement id set).
export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (isOwner()) return; // owner's browser — GA is already disabled, belt-and-braces
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === "function") w.gtag("event", event, params ?? {});
}
