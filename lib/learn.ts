// Content registry for the /learn section (the SEO pillar+cluster hub, separate
// from the funnel page). ONE source of truth: the sitemap, the /learn index, the
// per-page metadata, and the internal-linking (cluster -> pillar -> funnel) all
// read from here, so a title or URL can never drift between them.
//
// IA (2026 pillar+cluster model):
//   Pillar "commissions"   -> what the apps cost  (+ per-app fee breakdowns)
//   Pillar "leaving"       -> how to get off them (step-by-step)
//   Pillar "alternatives"  -> comparison hub      (+ one page per named competitor)

export type LearnGroup = "commissions" | "leaving" | "alternatives";
export type LearnKind = "pillar" | "cluster";

export type LearnPage = {
  slug: string; // path under /learn, e.g. "doordash-fees" -> /learn/doordash-fees
  kind: LearnKind;
  group: LearnGroup;
  title: string; // <title> / H1
  description: string; // meta description + index blurb
  // Cluster pages point at their pillar's slug; pillars point at themselves.
  pillarSlug: string;
};

// ── Pillar 1: delivery-app commissions ───────────────────────────────────────
const PILLAR_COMMISSIONS = "delivery-app-commissions";
// ── Pillar 2: leaving the apps ───────────────────────────────────────────────
const PILLAR_LEAVING = "leaving-delivery-apps";
// ── Pillar 3: alternatives / comparison hub ──────────────────────────────────
const PILLAR_ALTERNATIVES = "restaurant-online-ordering-alternatives";

export const LEARN_PAGES: LearnPage[] = [
  // Pillar 1 + fee-breakdown clusters
  {
    slug: PILLAR_COMMISSIONS,
    kind: "pillar",
    group: "commissions",
    title: "What DoorDash, Uber Eats & Grubhub Actually Cost You",
    description:
      "A plain breakdown of 2026 delivery-app commissions - DoorDash, Uber Eats and Grubhub tiers, the blended real-world cost, and what those fees do to a restaurant's margin.",
    pillarSlug: PILLAR_COMMISSIONS,
  },
  {
    slug: "doordash-fees",
    kind: "cluster",
    group: "commissions",
    title: "DoorDash Fees for Restaurants, Explained (2026)",
    description:
      "DoorDash's 2026 commission tiers - Basic 15%, Plus 25%, Premier 30% on delivery and 6% on pickup - and what they really cost you once processing and promotions stack on top.",
    pillarSlug: PILLAR_COMMISSIONS,
  },
  {
    slug: "uber-eats-fees",
    kind: "cluster",
    group: "commissions",
    title: "Uber Eats Fees for Restaurants, Explained (2026)",
    description:
      "Uber Eats' 2026 commission runs 15-30% depending on tier. Here's how the tiers work, what's added on top, and the real per-order cost to an independent restaurant.",
    pillarSlug: PILLAR_COMMISSIONS,
  },
  {
    slug: "grubhub-fees",
    kind: "cluster",
    group: "commissions",
    title: "Grubhub Fees for Restaurants, Explained (2026)",
    description:
      "Grubhub's 2026 marketing tiers - Basic 5%, Plus 15%, All-access 20%, plus an optional 10% when Grubhub handles delivery - and the true cost per order.",
    pillarSlug: PILLAR_COMMISSIONS,
  },
  // Pillar 2 (the step-by-step guide is the pillar itself)
  {
    slug: PILLAR_LEAVING,
    kind: "pillar",
    group: "leaving",
    title: "How to Get Your Restaurant Off Third-Party Delivery Apps",
    description:
      "An honest, step-by-step guide to moving diners to direct online ordering you own - what it actually takes, what to keep, and why owning the customer relationship matters more than the fee.",
    pillarSlug: PILLAR_LEAVING,
  },
  // Pillar 3 + one comparison page per named competitor
  {
    slug: PILLAR_ALTERNATIVES,
    kind: "pillar",
    group: "alternatives",
    title: "Restaurant Online-Ordering Alternatives, Compared",
    description:
      "A hub comparing the main restaurant online-ordering platforms - Toast, Square, Clover, Menufy, ChowNow, BentoBox and Restolabs - and where an owned, one-time-cost site fits.",
    pillarSlug: PILLAR_ALTERNATIVES,
  },
  {
    slug: "toast-alternative",
    kind: "cluster",
    group: "alternatives",
    title: "A Toast Online Ordering Alternative Without the Per-Order Fee",
    description:
      "Toast adds a $0.99 guest fee (or eats it) on online orders and ties ordering to its hardware and monthly plans. Here's an owned alternative with no per-order fee.",
    pillarSlug: PILLAR_ALTERNATIVES,
  },
  {
    slug: "square-online-ordering-alternative",
    kind: "cluster",
    group: "alternatives",
    title: "A Square Online Ordering Alternative for Restaurants",
    description:
      "Square Online is easy to start but thins out on catering, scheduling and real restaurant ordering as you grow. Here's where a purpose-built, owned site differs.",
    pillarSlug: PILLAR_ALTERNATIVES,
  },
  {
    slug: "clover-alternative",
    kind: "cluster",
    group: "alternatives",
    title: "A Clover Online Ordering Alternative Without the Monthly Stack",
    description:
      "Clover's online ordering is tied to its POS hardware, plans and app-market add-ons. Here's a one-time-cost, hardware-independent alternative you actually own.",
    pillarSlug: PILLAR_ALTERNATIVES,
  },
  {
    slug: "menufy-alternative",
    kind: "cluster",
    group: "alternatives",
    title: "A Menufy Alternative You Own Outright",
    description:
      "Menufy builds you a site but keeps it on their platform with a per-order fee to diners. Here's the difference when the site and ordering are yours with no recurring cut.",
    pillarSlug: PILLAR_ALTERNATIVES,
  },
  {
    slug: "chownow-alternative",
    kind: "cluster",
    group: "alternatives",
    title: "A ChowNow Alternative Without the Monthly Subscription",
    description:
      "ChowNow removes commission but charges a recurring monthly (and setup) fee to do it. Here's a one-time-cost alternative with the same commission-free promise.",
    pillarSlug: PILLAR_ALTERNATIVES,
  },
  {
    slug: "bentobox-alternative",
    kind: "cluster",
    group: "alternatives",
    title: "A BentoBox Alternative at a Fraction of the Monthly Cost",
    description:
      "BentoBox makes beautiful restaurant sites on a premium monthly subscription. Here's a comparable owned site for a one-time price instead of an ongoing bill.",
    pillarSlug: PILLAR_ALTERNATIVES,
  },
  {
    slug: "restolabs-alternative",
    kind: "cluster",
    group: "alternatives",
    title: "A Restolabs Alternative You Own, Not Rent",
    description:
      "Restolabs is a monthly-subscription online-ordering platform. Here's how an owned, one-time-cost restaurant site with its own ordering compares.",
    pillarSlug: PILLAR_ALTERNATIVES,
  },
];

export const LEARN_BASE = "/learn";

export function learnHref(slug: string): string {
  return `${LEARN_BASE}/${slug}`;
}

export function pillarPages(): LearnPage[] {
  return LEARN_PAGES.filter((p) => p.kind === "pillar");
}

export function clustersOf(pillarSlug: string): LearnPage[] {
  return LEARN_PAGES.filter((p) => p.kind === "cluster" && p.pillarSlug === pillarSlug);
}

export function getLearnPage(slug: string): LearnPage | undefined {
  return LEARN_PAGES.find((p) => p.slug === slug);
}
