// Pricing + commission-savings math, copied verbatim from the client template's
// src/lib/outreach.ts so the numbers on this public page can never drift from
// the trial popups shown inside client sites. Same formula, same defaults.
//
// Public DEFAULT pricing only. Per-lead quotes happen in DMs, never here.

export const PRICING = {
  fullPrice: 2600,
  discountedPrice: 1200,
};

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
