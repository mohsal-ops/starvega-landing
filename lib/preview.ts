"use client";

// Tiny pub/sub (same pattern as lib/pack-modal) so any trigger - the hero window,
// the mobile "click through a live demo" link, the floating Preview button - can
// open the one fullscreen live-demo viewer mounted by <PreviewHost>.
export type PreviewView = "site" | "dashboard";
type Listener = (view: PreviewView) => void;

const listeners = new Set<Listener>();
// A tap that lands before <PreviewHost> has lazily mounted is remembered here and
// replayed on mount, so an early click is never lost.
let pending: PreviewView | null = null;

export function openPreview(view: PreviewView = "site") {
  if (!listeners.size) pending = view;
  listeners.forEach((l) => l(view));
}

export function takePendingPreview(): PreviewView | null {
  const v = pending;
  pending = null;
  return v;
}

export function subscribePreview(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export const DEMO_URL = (process.env.NEXT_PUBLIC_DEMO_URL || "https://starvega-demo.vercel.app").replace(/\/$/, "");
