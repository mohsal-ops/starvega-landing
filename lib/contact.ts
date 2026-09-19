import { SITE } from "./site";

// One place for the "reach out" experience: the ready-to-send message, the
// per-channel deep links, and a tiny pub/sub so any CTA (the floating button,
// the preview bar, the pricing modal) can open the same contact popover.

export const CONTACT_SUBJECT = "I want a Starvega site for my restaurant";
export const CONTACT_MESSAGE =
  "Hi! I run a restaurant and I'd like my own website with my own zero-commission online ordering. Can we talk about getting me set up?";

// Gmail web-compose: a real prefilled compose window that works on desktop even
// with no default mail app (same approach as EmailUsCta). The visitor just hits
// Send, or edits first.
export function emailComposeUrl(): string {
  const to = encodeURIComponent(SITE.contactEmail);
  const su = encodeURIComponent(CONTACT_SUBJECT);
  const body = encodeURIComponent(CONTACT_MESSAGE);
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${body}`;
}

// mailto fallback (native mail client) for anyone who prefers it.
export function mailtoUrl(): string {
  return `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(CONTACT_SUBJECT)}&body=${encodeURIComponent(CONTACT_MESSAGE)}`;
}

export const instagramDmUrl = SITE.instagramDmUrl;
export const contactEmail = SITE.contactEmail;

// ── Opener pub/sub (mirrors lib/pack-modal.ts) ──────────────────────────────
type Listener = (open: boolean) => void;
const listeners = new Set<Listener>();

export function openContactMenu(): void {
  listeners.forEach((l) => l(true));
}
export function closeContactMenu(): void {
  listeners.forEach((l) => l(false));
}
export function subscribeContactMenu(l: Listener): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
