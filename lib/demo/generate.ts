import { CUISINES, CATERING_CARDS, PHOTO_POOL, type Cuisine } from "./cuisines";

export type DemoFeatured = { name: string; priceCents: number; image: string };
export type DemoMenuItem = { name: string; desc?: string; priceCents: number; image: string };
export type DemoConfig = {
  businessName: string;
  cuisineKey: string;
  cuisineLabel: string;
  city: string | null;
  hero: { lead: string; sub: string; image: string };
  featured: DemoFeatured[];
  gallery: string[];
  menu: { name: string; items: DemoMenuItem[] }[];
  catering: { cards: { title: string; body: string }[]; items: DemoFeatured[] };
  faq: { q: string; a: string }[];
  navLinks: string[];
};

export const NAV_LINKS = ["Home", "Menu", "Catering", "Rewards", "Our Story"];

export function formatCents(c: number): string {
  return "$" + (c / 100).toFixed(2);
}

export function buildDemoConfig(input: {
  businessName: string;
  cuisineKey: string;
  city?: string | null;
  photoUrls?: string[];
}): DemoConfig {
  const cuisine: Cuisine = CUISINES[input.cuisineKey] || CUISINES.other;
  const uploaded = (input.photoUrls || []).filter(Boolean);
  const city = input.city?.trim() || null;

  // hero = first uploaded photo, else first pool image
  const heroImage = uploaded[0] || PHOTO_POOL[0];

  // content images: remaining uploads first, then the pool, cycled. When the
  // hero came from the pool (no uploads), start content after it so the first
  // featured item doesn't repeat the hero image.
  const content = uploaded.length
    ? [...uploaded.slice(1), ...PHOTO_POOL]
    : [...PHOTO_POOL.slice(1), PHOTO_POOL[0]];
  let cursor = 0;
  const nextImg = () => content[cursor++ % content.length];

  const featured: DemoFeatured[] = cuisine.featured.map((f) => ({
    name: f.name,
    priceCents: f.priceCents,
    image: nextImg(),
  }));

  const menu = cuisine.menu.map((cat) => ({
    name: cat.name,
    items: cat.items.map((it) => ({ ...it, image: nextImg() })),
  }));

  // gallery = uploaded photos if any, else a slice of the pool
  const gallery = uploaded.length ? uploaded : PHOTO_POOL.slice(0, 8);

  return {
    businessName: input.businessName,
    cuisineKey: cuisine.key,
    cuisineLabel: cuisine.label,
    city,
    hero: {
      lead: cuisine.heroLead,
      sub: city ? `${cuisine.heroSub} In ${city}.` : cuisine.heroSub,
      image: heroImage,
    },
    featured,
    gallery,
    menu,
    catering: { cards: CATERING_CARDS, items: featured },
    faq: cuisine.faq,
    navLinks: NAV_LINKS,
  };
}
