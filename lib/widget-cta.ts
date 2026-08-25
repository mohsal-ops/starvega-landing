"use client";

import type Lenis from "lenis";

// Every "door" into the instant-preview widget goes through here. There is only
// ONE widget (the <section id="cta"> at the end of the funnel); these helpers
// just scroll to it and remember which entry point sent the visitor, so the
// widget_opened event can be attributed. No forked forms, no duplicate state.

export type EntryPoint = "sticky_nav" | "post_hook" | "post_proof" | "final_cta";

// Default is "final_cta": a visitor who simply scrolls to the widget and starts
// typing (without using one of the shortcut doors) counts as the final section.
let currentEntryPoint: EntryPoint = "final_cta";

// The site's Lenis instance, registered by <SmoothScroll>. Null when the visitor
// has prefers-reduced-motion (no smooth scroll) — we fall back to native scroll.
let lenis: Lenis | null = null;

export function registerLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getEntryPoint(): EntryPoint {
  return currentEntryPoint;
}

const WIDGET_ID = "cta";
const NAME_FIELD_ID = "instant-demo-name";
const HEADER_OFFSET = 80; // matches the widget's scroll-mt-20 (5rem)

/** Send the visitor to the one widget and record which door they used. */
export function openWidget(entryPoint: EntryPoint) {
  currentEntryPoint = entryPoint;
  if (typeof document === "undefined") return;

  const target = document.getElementById(WIDGET_ID);
  if (!target) return;

  if (lenis) lenis.scrollTo(target, { offset: -HEADER_OFFSET });
  else target.scrollIntoView({ behavior: "smooth" });

  // Put the cursor in the first field so the widget is truly "opened" and ready.
  // preventScroll keeps the smooth scroll above from being interrupted. Focusing
  // the field fires its onFocus -> markOpened, which logs widget_opened tagged
  // with the entry point we just set. Absent in the "preview" phase — harmless.
  const nameField = document.getElementById(NAME_FIELD_ID) as HTMLElement | null;
  nameField?.focus({ preventScroll: true });
}
