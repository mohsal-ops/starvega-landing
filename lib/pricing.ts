import { featureStatus, type FeatureKey } from "./features";

// Pricing + commission-savings math, copied verbatim from the client template's
// src/lib/outreach.ts so the numbers on this public page can never drift from
// the trial popups shown inside client sites. Same formula, same defaults.
//
// Public DEFAULT pricing only. Per-lead quotes happen in DMs, never here.

export const PRICING = {
  // Struck-through anchor shown next to the live price in the Offer section
  // (what a US agency charges for a custom site with ordering: $5k-$15k).
  fullPrice: 4999,
};

// Hosting & care: free for the first 12 months on every plan, then monthly. Covers hosting,
// the database, security updates, fixes and small changes - so the site keeps
// working for years instead of rotting after launch.
export const CARE_MONTHLY_USD = 39;
export const CARE_FREE_MONTHS = 12;
export const CARE_NOTE =
  "Hosting & care is free for the first year. Then it's $39 a month. Cancel any time and keep your site. It covers hosting, updates, fixes and small changes. No commission, ever.";

// POS is included on every plan. Until a real restaurant is live on it, the
// claim carries "early access" (feature status in lib/features.ts).
const POS_LINE =
  featureStatus("pos_square") === "live"
    ? "Orders go straight into your Square or Clover POS"
    : "Orders go into your Square or Clover (early access)";
const APP_LINE =
  featureStatus("installable_app") === "live"
    ? "Customers put your restaurant on their phone like an app"
    : "Add-to-home-screen app (coming soon)";

// ── Product ladder (the 3 packs) ─────────────────────────────────────────────
// One-time build prices, mirroring src/lib/packages.ts in the builder panel +
// client template. This is the ONLY place the landing defines pack prices - the
// pricing popup, the Offer section, and the server-side checkout amount all read
// it, so a price can never drift.
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
    price: 999,
    audience: "Food trucks and small counters. Your first website.",
    features: [
      "Home, Story, Menu & Location pages",
      "Online orders for pickup. No commission.",
      POS_LINE,
      "Change your menu, prices and hours any time",
      "Set up to show up on Google",
    ],
  },
  {
    tier: "STANDARD",
    label: "Standard",
    price: 1999,
    popular: true,
    audience: "Most sit-down restaurants. Every tool you need.",
    features: [
      "Everything in Starter, plus:",
      APP_LINE,
      "Your phone buzzes for every new order",
      "Pickup, delivery, and order-ahead times",
      "Catering, photo gallery, gift cards & blog",
      "Edit your reviews, colors and words",
    ],
  },
  {
    tier: "PRO",
    label: "Pro",
    price: 3499,
    audience: "More than one location, or you want it all.",
    features: [
      "Everything in Standard, plus:",
      "Full Rewards program + Kids Zone",
      "Run more than one location",
      featureStatus("monthly_report") === "live"
        ? "Monthly email: what you saved vs. the delivery apps"
        : "Monthly savings email (coming soon)",
      "See your numbers and add your team",
      "You go first for setup and help",
    ],
  },
];

// Loyalty/SMS is a separate small monthly add-on on every pack (real per-message
// cost) - the one honest recurring line. Never bundled into a pack's one-time price.
export const LOYALTY_ADDON_NOTE =
  "Want the loyalty club? Add it to any plan for a small monthly fee. It just covers the cost of the texts.";

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
export const BUILD_PRICE_USD = 1999;
export const BUILD_PRICE_LABEL = formatUsd(BUILD_PRICE_USD); // "$1,999"

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
    id: "native_app",
    feature: "native_app",
    label: "Your own App Store app",
    blurb: "An App Store and Google Play app with your name and logo, published under your own accounts.",
    oneTime: { min: 2500, max: 2500 },
    monthly: { min: 49, max: 49 },
    note: "One-time build plus $49/month for store updates. Apple charges you $99/year directly.",
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
