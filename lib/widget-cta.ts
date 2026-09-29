"use client";

// Every "Get my free mockup" door goes through here. The page has two copies of
// the same lead form (hero + final section, both marked [data-lead-form]); a CTA
// scrolls to whichever is nearest and focuses its first field, remembering which
// door was used so the widget_opened event can be attributed.

export type EntryPoint = "sticky_nav" | "hero" | "offer" | "preview" | "final_cta";

// Set by a CTA click, consumed by the next form focus. Null = the visitor went
// straight to a form, which then reports its own placement.
let pendingEntryPoint: EntryPoint | null = null;

export function takeEntryPoint(fallback: EntryPoint): EntryPoint {
  const e = pendingEntryPoint ?? fallback;
  pendingEntryPoint = null;
  return e;
}

/** Send the visitor to the nearest lead form and record which door they used. */
export function openWidget(entryPoint: EntryPoint) {
  pendingEntryPoint = entryPoint;
  if (typeof document === "undefined") return;

  const forms = Array.from(document.querySelectorAll<HTMLElement>("[data-lead-form]"));
  if (!forms.length) return;
  const target = forms
    .map((el) => ({ el, d: Math.abs(el.getBoundingClientRect().top) }))
    .sort((a, b) => a.d - b.d)[0].el;

  target.scrollIntoView({ behavior: "smooth", block: "center" });

  // preventScroll keeps the smooth scroll from being interrupted; the focus
  // fires the form's onFocus -> widget_opened tagged with this entry point.
  target.querySelector<HTMLInputElement>("input[name='name']")?.focus({ preventScroll: true });
}
