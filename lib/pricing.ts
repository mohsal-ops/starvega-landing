import { featureStatus, type FeatureKey } from "./features";

// Pricing + commission-savings math, copied verbatim from the client template's
// src/lib/outreach.ts so the numbers on this public page can never drift from
// the trial popups shown inside client sites. Same formula, same defaults.
//
// Public DEFAULT pricing only. Per-lead quotes happen in DMs, never here.

export const PRICING = {
  // Struck-through anchor shown next to the live price in the Offer section.
  // The actual go-live price is BUILD_PRICE_USD below (single source of truth).
  fullPrice: 2600,
};

// ── Product ladder (the 3 packs) ─────────────────────────────────────────────
// One-time prices, mirroring src/lib/packages.ts in the builder panel + client
// template. This is the ONLY place the landing defines pack prices - the pricing
// popup, the Offer section, and the server-side checkout amount all read it, so a
// price can never drift. Standard/Pro are a starting point and safe to adjust.
export type PackTier = "STARTER" | "STANDARD" | "PRO";

export type Pack = {
  tier: PackTier;
  label: string;
  price: number;
  audience: string;
  features: string[];
  popular?: boolean;
};

export const PACKAGES: Pack[] = [
  {
    tier: "STARTER",
    label: "Starter",
    price: 399,
    audience: "Food trucks & counter-service, first website ever.",
    features: [
      "Home, Story, Menu & Location pages",
      "Online ordering - pickup",
      "Edit your menu, prices, categories & hours",
      "Indexable pages + standard SEO",
    ],
  },
  {
    tier: "STANDARD",
    label: "Standard",
    price: 999,
    popular: true,
    audience: "Most sit-down independents who want the real toolkit.",
    features: [
      "Everything in Starter, plus:",
      "Catering, photo gallery, gift cards & blog",
      "Ordering - pickup + delivery + time-slot scheduling",
      "Gallery/branding controls, reviews & content editor",
      "Structured-data SEO on an indexable menu",
    ],
  },
  {
    tier: "PRO",
    label: "Pro",
    price: 1999,
    audience: "Multi-location owners, or anyone who wants everything.",
    features: [
      "Everything in Standard, plus:",
      "Kids Zone + a full Rewards program",
      "Multi-location aware ordering",
      "Full analytics, team & multi-location management",
      "AI onboarding tools + priority setup",
    ],
  },
];

// Loyalty/SMS is a separate small monthly add-on on every pack (real per-message
// cost) - the one honest recurring line. Never bundled into a pack's one-time price.
export const LOYALTY_ADDON_NOTE =
  "Add Loyalty & SMS to any plan - a small monthly add-on that only covers the real cost of sending texts.";

// Custom / bespoke option. No fixed price and no self-serve checkout: it starts
// a conversation. Rendered as a fourth card that opens a contact CTA.
export const CUSTOM_PACK = {
  label: "Custom",
  audience: "Want something bespoke: a custom design, extra features, integrations, or a bigger build.",
  features: [
    "A design tailored to your brand from scratch",
    "Custom features, pages, or third-party integrations",
    "Multi-location or unusual ordering workflows",
    "Quoted to the project after a quick chat",
  ],
};

export const PACKS_BY_TIER: Record<PackTier, Pack> = Object.fromEntries(
  PACKAGES.map((p) => [p.tier, p]),
) as Record<PackTier, Pack>;

// Server-trusted price lookup: returns the pack's price in USD, or null for an
// unknown tier. The checkout/PayPal amount MUST come from here, never the client.
export function packPriceUsd(tier: string): number | null {
  return (PACKS_BY_TIER as Record<string, Pack | undefined>)[tier]?.price ?? null;
}

export function isPackTier(v: unknown): v is PackTier {
  return v === "STARTER" || v === "STANDARD" || v === "PRO";
}

// Legacy single build price. Retained only as a fallback for any pre-packs lead
// that reaches checkout without a packTier; the public offer is now the 3 packs.
export const BUILD_PRICE_USD = 899;
export const BUILD_PRICE_LABEL = formatUsd(BUILD_PRICE_USD); // "$899"

// Same default savings inputs as outreach.ts DEFAULTS.savings.
const SAVINGS = {
  estimatedOrdersPerDay: 20,
  avgOrderValue: 25,
  commissionPct: 30,
};

export function formatUsd(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

// Monthly savings vs. third-party delivery apps:
//   orders/day × ~30 days × avg order value × commission %.
export function savingsBreakdown() {
  const { estimatedOrdersPerDay, avgOrderValue, commissionPct } = SAVINGS;
  const monthlyOrders = estimatedOrdersPerDay * 30;
  const monthlyGross = monthlyOrders * avgOrderValue;
  const monthlySavings = Math.round((monthlyGross * commissionPct) / 100);
  const annualSavings = monthlySavings * 12;
  return {
    estimatedOrdersPerDay,
    avgOrderValue,
    commissionPct,
    monthlyOrders,
    monthlyGross,
    monthlySavings,
    annualSavings,
  };
}

// ── Add-ons (NOT PUBLISHED) ──────────────────────────────────────────────────
// Structured add-ons for the platform build. Hidden behind SHOW_ADD_ONS = false
// AND each add-on's feature status in lib/features.ts, so nothing appears on the
// live page until Mohsal confirms the prices and flips both.
// Every price below is a SUGGESTED default: TO CONFIRM BY MOHSAL.

export const SHOW_ADD_ONS = false;

export type AddOn = {
  id: "pos" | "native_app" | "care_plan";
  feature: FeatureKey | FeatureKey[];
  label: string;
  blurb: string;
  /** One-time price range in USD (setup). */
  oneTime?: { min: number; max: number };
  /** Monthly price range in USD. */
  monthly?: { min: number; max: number };
  note: string;
};

export const ADD_ONS: AddOn[] = [
  {
    id: "pos",
    feature: ["pos_square", "pos_clover"],
    label: "POS connection",
    blurb: "Website orders print in your kitchen like any other ticket, and your menu stays in sync.",
    oneTime: { min: 400, max: 800 }, // TO CONFIRM BY MOHSAL (depends on the POS)
    note: "Setup per restaurant. Price depends on your POS.",
  },
  {
    id: "native_app",
    feature: "native_app",
    label: "Your own app",
    blurb: "An App Store and Google Play app with your name and logo, published under your own accounts.",
    oneTime: { min: 1800, max: 3500 }, // TO CONFIRM BY MOHSAL
    monthly: { min: 49, max: 79 }, // TO CONFIRM BY MOHSAL
    note: "One-time build plus a small monthly fee for updates.",
  },
  {
    id: "care_plan",
    feature: "care_plan",
    label: "Care plan",
    blurb: "We watch your site every day, fix problems, and make small changes for you.",
    monthly: { min: 49, max: 99 }, // TO CONFIRM BY MOHSAL
    note: "Month to month. Cancel any time.",
  },
];

/** Add-ons that may be shown: the master switch is on AND the feature isn't hidden. */
export function visibleAddOns(): (AddOn & { status: "live" | "soon" })[] {
  if (!SHOW_ADD_ONS) return [];
  return ADD_ONS.flatMap((a) => {
    const keys = Array.isArray(a.feature) ? a.feature : [a.feature];
    const statuses = keys.map(featureStatus);
    const status = statuses.includes("live") ? "live" : statuses.includes("soon") ? "soon" : null;
    return status ? [{ ...a, status }] : [];
  });
}
