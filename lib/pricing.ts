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

// The single public price for the paid "build my site" checkout (the ad-funnel
// path: instant-demo preview -> /checkout/[leadId] -> PayPal). ONE source of
// truth — the checkout page, the PayPal order amount, and any price copy all
// read from here. Do not hardcode 799 anywhere else.
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
