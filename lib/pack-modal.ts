"use client";

// Tiny pub/sub so any CTA anywhere (nav, preview overlay, inline bands) can open
// the one pricing popup, without prop-drilling or a context provider. Mirrors the
// widget-cta singleton pattern already used on this site.
type Listener = (open: boolean) => void;

let open = false;
const listeners = new Set<Listener>();

export function openPackModal() {
  open = true;
  listeners.forEach((l) => l(true));
}

export function closePackModal() {
  open = false;
  listeners.forEach((l) => l(false));
}

export function subscribePackModal(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function isPackModalOpen(): boolean {
  return open;
}
