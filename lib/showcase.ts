"use client";

// The four REAL restaurant sites shown in the hero showcase - one per design, all
// running on the same system. Captures live in public/showcase/<key>-{top,full,m}.webp
// (taken from the live sites; re-capture when a site changes a lot).
export type ShowcaseSite = {
  key: string;
  name: string;
  city: string;
  style: string; // the design name a buyer picks
  vibe: string; // one line: who this design suits
  url: string;
  accent: string; // tint for chips / progress
  theme: string; // template design slug (builder THEME_SLUGS) - the launch wizard's design pick
};

export const SHOWCASE: ShowcaseSite[] = [
  { key: "sj", name: "Southern Jerks", city: "Houston, TX", style: "Classic", vibe: "Clean and bright, fits almost any kitchen", url: "https://southernjerkshtx.com", accent: "#e8a70c", theme: "classic-starvega" },
  { key: "bases", name: "Bases Burgers", city: "Houston, TX", style: "Smash & Bold", vibe: "Loud launch-drop energy for burgers & street food", url: "https://bases-nine.vercel.app", accent: "#0aa6e8", theme: "smash-bold" },
  { key: "doubledip", name: "Double Dip", city: "Washington, DC", style: "Diner Classic", vibe: "Warm, retro and menu-first", url: "https://double-dip.vercel.app", accent: "#e0574a", theme: "diner-classic" },
  { key: "astoria", name: "Astoria BBQ", city: "Queens, NY", style: "Refined", vibe: "Dark, editorial, photo-led", url: "https://astoria-bbq.vercel.app", accent: "#b88a3e", theme: "refined-elegant" },
];

// Same tiny pub/sub as lib/preview: any trigger opens the one fullscreen viewer
// mounted lazily by <ShowcaseHost>; an early tap is replayed on mount.
type Listener = (index: number) => void;
const listeners = new Set<Listener>();
let pending: number | null = null;

// The design the visitor last looked at in the viewer - sent with the mockup
// request so the mockup can be built in the style they liked.
let pickedStyle = "";
export function setPickedStyle(style: string) {
  pickedStyle = style;
}
export function getPickedStyle() {
  return pickedStyle;
}

export function openShowcase(index = 0) {
  if (!listeners.size) pending = index;
  listeners.forEach((l) => l(index));
}
export function takePendingShowcase(): number | null {
  const v = pending;
  pending = null;
  return v;
}
export function subscribeShowcase(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}
