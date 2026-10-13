// Feature status registry: the ONE place that decides what the landing page is
// allowed to claim. Pricing cards, add-ons, JSON-LD, FAQ and /learn pages read
// from here, so a claim can't drift ahead of what's actually shipped.
//
//   live   → shipped AND running for at least one real client: may be claimed.
//   soon   → built or in progress: may be shown with a "Coming soon" badge only.
//   hidden → not shown anywhere (default for everything new).
//
// Rule (Mohsal): never flip a feature to "live" until it has been tested end to
// end with a real client. Square/Clover need a real restaurant on each first.

export type FeatureStatus = "live" | "soon" | "hidden";

export type FeatureKey =
  // already sold on the page today
  | "online_ordering"
  | "pickup"
  | "delivery_uber"
  | "loyalty_sms"
  | "catering"
  | "gift_cards"
  // platform build (all hidden until Mohsal flips them)
  | "pos_square"
  | "pos_clover"
  | "pos_toast"
  | "delivery_doordash"
  | "installable_app"
  | "order_push"
  | "monthly_report"
  | "native_app"
  | "care_plan";

export interface Feature {
  status: FeatureStatus;
  /** Short public name, used for badges and add-on cards. */
  label: string;
}

export const FEATURES: Record<FeatureKey, Feature> = {
  online_ordering: { status: "live", label: "Online ordering" },
  pickup: { status: "live", label: "Pickup orders" },
  delivery_uber: { status: "live", label: "Delivery by Uber couriers" },
  loyalty_sms: { status: "live", label: "Loyalty & SMS club" },
  catering: { status: "live", label: "Catering requests" },
  gift_cards: { status: "live", label: "Gift cards" },

  pos_square: { status: "soon", label: "Orders sent to your Square POS" },
  pos_clover: { status: "soon", label: "Orders sent to your Clover POS" },
  pos_toast: { status: "hidden", label: "Toast POS connection" },
  delivery_doordash: { status: "hidden", label: "DoorDash couriers" },
  installable_app: { status: "live", label: "Add-to-home-screen app" },
  order_push: { status: "live", label: "Order-ready notifications" },
  monthly_report: { status: "soon", label: "Monthly results email" },
  native_app: { status: "hidden", label: "Your own App Store app" },
  care_plan: { status: "live", label: "Care plan" },
};

export const featureStatus = (k: FeatureKey): FeatureStatus => FEATURES[k].status;
export const isLive = (k: FeatureKey) => FEATURES[k].status === "live";
/** Shown at all (live, or soon with a badge). */
export const isVisible = (k: FeatureKey) => FEATURES[k].status !== "hidden";
