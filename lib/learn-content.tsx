// Body content for every /learn article, keyed by slug (metadata - title,
// description, pillar grouping - lives in lib/learn.ts). Authored as structured
// data so the dynamic route can render consistent AEO-friendly structure: a
// plain-language `lead` answer up top (what answer engines quote), then sections.
//
// All delivery-app fee figures are the verified 2026 numbers from the SEO brief;
// competitor figures were researched (see PR notes) - keep them factual and, if
// a platform changes its pricing, update it HERE in one place.

export type LearnTable = {
  caption?: string;
  head: string[];
  rows: string[][];
};

export type LearnSection = {
  h: string;
  body?: string[]; // paragraphs
  bullets?: string[];
  table?: LearnTable;
};

export type LearnArticle = {
  // One-paragraph direct answer, rendered as the standfirst under the H1.
  lead: string;
  sections: LearnSection[];
  updated: string; // ISO date, shown + used for Article schema
};

const UPDATED = "2026-08-31";

// Reused closing line of reasoning for the comparison pages' "the alternative"
// section - kept as a helper so the shared pitch is consistent while each page's
// GAP section stays platform-specific.
const OWNED_ALT = (whatTheyDo: string): LearnSection => ({
  h: "The owned alternative",
  body: [
    `Starvega builds the same thing a different way: a fast website with its own online ordering and a dashboard you log into, for a one-time price. ${whatTheyDo} There's no commission on orders and no monthly platform fee to keep it running - once it's live, the site, the ordering, and the customer data are yours.`,
    "That's the whole difference: you pay once for something you own, instead of renting it (or paying per order) for as long as you're in business.",
  ],
});

export const LEARN_CONTENT: Record<string, LearnArticle> = {
  // ── PILLAR 1 ────────────────────────────────────────────────────────────────
  "delivery-app-commissions": {
    lead: "In 2026, DoorDash, Uber Eats, and Grubhub take roughly 15-30% of each delivery order in commission, and once payment processing and in-app promotions stack on top, the blended real-world cost commonly lands between 25% and 40% of the order. For an independent restaurant, that is usually the single largest controllable cost in the business.",
    updated: UPDATED,
    sections: [
      {
        h: "The 2026 numbers, app by app",
        body: [
          "Each marketplace publishes tiered rates. The lower tier costs less but buries you in the app; the higher tiers buy visibility. Here is where they actually sit in 2026:",
        ],
        table: {
          caption: "Marketplace commission on delivery orders, 2026",
          head: ["Marketplace", "Commission tiers", "Also note"],
          rows: [
            ["DoorDash", "15% Basic · 25% Plus · 30% Premier", "6% on pickup orders"],
            ["Uber Eats", "15-30% depending on tier", "Plus processing on top"],
            ["Grubhub", "5% Basic · 15% Plus · 20% All-access", "+ optional 10% if Grubhub delivers"],
          ],
        },
      },
      {
        h: "What that does to your margin",
        body: [
          "The National Restaurant Association reports a median pre-tax margin for independent restaurants of roughly 2.8-4.0%. Marketplace commissions do not come out of that margin - they dwarf it.",
          "Work a realistic example: an independent doing 650 marketplace orders a month at a $25 average ticket is $16,250 in monthly marketplace sales. At a blended 25% cost, that is about $4,060 a month - roughly $48,750 a year handed to the marketplaces. That is a concrete, attributable number, not a vague 'you're losing a lot.'",
        ],
      },
      {
        h: "The part a price markup doesn't fix",
        body: [
          "Many owners already mark their in-app menu up 15-30% to offset commission, and that is sensible. But it only addresses the fee. It does not address the bigger problem: on a marketplace, the platform owns the customer relationship. The email, the phone number, the order history, the ability to bring that diner back - all of it sits with the app, not with you.",
          "That is true whether or not you have marked up your prices. You can raise the ticket and still be renting access to your own customers.",
        ],
      },
      {
        h: "Read the full breakdown, or the way out",
        body: [
          "Per-app detail: the DoorDash, Uber Eats, and Grubhub fee breakdowns each go tier by tier. If you'd rather see how restaurants actually move diners onto ordering they own, start with the step-by-step guide.",
        ],
      },
    ],
  },

  "doordash-fees": {
    lead: "DoorDash charges restaurants 15% (Basic), 25% (Plus), or 30% (Premier) in commission on delivery orders in 2026, plus 6% on pickup orders. Once payment processing and promotions are added, the real cost of a DoorDash order to a restaurant often lands well above the headline rate.",
    updated: UPDATED,
    sections: [
      {
        h: "The DoorDash tiers, plainly",
        bullets: [
          "Basic - 15% commission on delivery. Lowest fee, lowest placement in the app.",
          "Plus - 25% commission. Adds DashPass visibility to subscribed diners.",
          "Premier - 30% commission. Top placement and the broadest delivery area.",
          "Pickup - 6% commission on orders the customer collects themselves.",
        ],
      },
      {
        h: "What an order really costs",
        body: [
          "The commission is only the headline. Payment processing sits on top, and the promotions many restaurants run to stay visible (discounts, sponsored placement) come out of the same margin. Stacked together, a Plus or Premier delivery order commonly costs a restaurant well into the 25-40% range once everything is counted.",
        ],
      },
      {
        h: "The cost the fee doesn't show",
        body: [
          "Even on Basic at 15%, the order is DoorDash's order. You don't get the diner's contact details or the ability to bring them back directly - the relationship and the repeat-order data stay on the platform. A menu markup can offset the percentage; it can't buy back the customer.",
        ],
      },
      {
        h: "See the whole picture",
        body: [
          "This is one of three marketplaces most restaurants run at once. The commissions pillar puts DoorDash, Uber Eats, and Grubhub side by side and works the annual cost to your margin.",
        ],
      },
    ],
  },

  "uber-eats-fees": {
    lead: "Uber Eats charges restaurants between 15% and 30% commission on orders in 2026, depending on the plan tier, with payment processing added on top. As with the other marketplaces, the effective cost per order typically runs higher than the base commission once promotions are included.",
    updated: UPDATED,
    sections: [
      {
        h: "How the Uber Eats tiers work",
        body: [
          "Uber Eats sells plans the same way its rivals do: a lower commission tier that keeps you present in the app, and higher tiers (typically in the 25-30% range) that buy reach, delivery radius, and promotional placement. The exact tier names shift, but the economics don't - more visibility costs more commission.",
        ],
      },
      {
        h: "What an order really costs",
        body: [
          "Add card processing and any in-app promotion to a 25-30% commission and a single delivery order can cost a restaurant a third or more of the ticket. Against a low-single-digit margin, that is the difference between a profitable order and one you lose money on.",
        ],
      },
      {
        h: "The cost the fee doesn't show",
        body: [
          "Uber Eats keeps the customer relationship. You fulfil the order, but the diner is Uber's - their contact details, their history, and the next-order decision live in Uber's app, not your database. Marking up your Uber Eats menu offsets the fee without changing who owns the customer.",
        ],
      },
      {
        h: "See the whole picture",
        body: [
          "The commissions pillar compares Uber Eats with DoorDash and Grubhub and shows the yearly total these fees add up to for a typical independent.",
        ],
      },
    ],
  },

  "grubhub-fees": {
    lead: "Grubhub charges restaurants a marketing commission of 5% (Basic), 15% (Plus), or 20% (All-access) in 2026, and adds an optional ~10% delivery commission when Grubhub handles the delivery. Combined with processing, a full-service Grubhub order can cost a restaurant around a third of the ticket.",
    updated: UPDATED,
    sections: [
      {
        h: "The Grubhub tiers, plainly",
        bullets: [
          "Basic - 5% marketing commission. Cheapest, least visibility.",
          "Plus - 15% marketing commission. More placement and promotion.",
          "All-access - 20% marketing commission. Maximum reach in the app.",
          "Delivery - an optional ~10% on top when Grubhub's drivers deliver instead of yours.",
        ],
      },
      {
        h: "What an order really costs",
        body: [
          "Stack the delivery commission onto an All-access plan and add card processing, and the marketing-plus-delivery total climbs toward 30%+ before promotions. Grubhub's headline 'from 5%' is technically true and practically misleading for a restaurant that wants real order volume.",
        ],
      },
      {
        h: "The cost the fee doesn't show",
        body: [
          "Like the others, Grubhub owns the diner. The order history and contact details that would let you win repeat business directly stay inside Grubhub. A price markup narrows the fee gap; it doesn't hand you back the customer relationship.",
        ],
      },
      {
        h: "See the whole picture",
        body: [
          "The commissions pillar sets Grubhub next to DoorDash and Uber Eats and works out the annual cost against a real restaurant margin.",
        ],
      },
    ],
  },

  // ── PILLAR 2 ────────────────────────────────────────────────────────────────
  "leaving-delivery-apps": {
    lead: "You can move most of your orders off third-party delivery apps, but not by deleting them overnight. The realistic path is to stand up online ordering you own, make it the easiest option everywhere you touch a customer, and use the marketplaces only for discovery - so you keep the reach without paying commission on the orders you could have taken directly.",
    updated: UPDATED,
    sections: [
      {
        h: "Be honest about what the apps are good at",
        body: [
          "Marketplaces are a discovery channel. New diners find you there, and that has real value. The problem isn't that they exist - it's using them for repeat orders from customers who already know you, where you're paying 25-40% to a middleman for a sale you'd have gotten anyway.",
          "So the goal isn't zero apps. It's moving the repeat business you already earned onto ordering you own.",
        ],
      },
      {
        h: "The step-by-step",
        bullets: [
          "Stand up direct ordering you own - a fast website with its own pickup/delivery ordering and a dashboard, not a link that hands the order to another app.",
          "Put it everywhere: your Google Business Profile, Instagram bio, receipts, table tents, takeout bags, and the on-hold message. The direct link should be the path of least resistance.",
          "Make direct the better deal. Reserve your best price, loyalty, and promos for direct orders. Diners follow the incentive.",
          "Capture the relationship. Because a direct order gives you the email and phone number, you can bring that customer back yourself - the thing the apps never let you do.",
          "Keep the apps for discovery only. Leave them on for new-customer reach, but stop feeding them your regulars.",
        ],
      },
      {
        h: "What it actually takes",
        body: [
          "This isn't free effort. Someone has to set up the ordering, put the link everywhere, and nudge regulars the first few times. What it doesn't require is a monthly platform bill or a per-order cut - which is the whole point. Done once, direct ordering keeps paying you back on every order that would otherwise have carried a commission.",
        ],
      },
      {
        h: "The payoff is ownership, not just savings",
        body: [
          "Even if the fee were zero, owning the customer would still matter. Direct ordering gives you the email, the phone number, and the order history - the raw material for repeat business, and something you can never get back from a marketplace. The commission savings are real; the customer relationship is the part that compounds.",
        ],
      },
    ],
  },

  // ── PILLAR 3 (hub) ──────────────────────────────────────────────────────────
  "restaurant-online-ordering-alternatives": {
    lead: "The main restaurant online-ordering platforms fall into a few groups: POS-tied systems (Toast, Square, Clover), commission-free but subscription-based ordering (ChowNow, Restolabs), premium website platforms (BentoBox), and hosted order pages funded by a diner fee (Menufy). Almost all of them are something you rent monthly or pay per order. The alternative is a site you own outright for a one-time price.",
    updated: UPDATED,
    sections: [
      {
        h: "The landscape, by model",
        table: {
          caption: "How the common platforms actually charge",
          head: ["Platform", "Model", "Recurring cost"],
          rows: [
            ["Toast", "POS-tied online ordering", "Monthly SaaS + hardware + $0.99/order"],
            ["Square", "POS + free online store", "Processing per order; features thin out"],
            ["Clover", "POS-tied, app-market add-ons", "Monthly plans + hardware"],
            ["Menufy", "Hosted order page", "~$1.75 diner fee per order"],
            ["ChowNow", "Commission-free ordering", "$249-$449/mo + setup + per-order processing"],
            ["BentoBox", "Premium website platform", "Premium monthly subscription"],
            ["Restolabs", "Commission-free ordering", "$69-$199/mo, site/app extra"],
            ["Starvega", "Owned site + ordering", "One-time price, no platform fee"],
          ],
        },
      },
      {
        h: "The question that sorts them",
        body: [
          "Every one of these can take an online order. The real difference is who ends up owning the site and the customer data, and whether you're paying for it forever. Ask two questions of any option: do I own this if I stop paying, and does someone take a cut of every order? For most of the list, the answers are 'no' and 'yes.'",
        ],
      },
      {
        h: "Compare a specific platform",
        body: [
          "Each comparison below is written for that platform specifically - Toast's per-order fee, Square's feature ceiling, Menufy's diner fee, ChowNow's subscription, and so on. Pick the one you're weighing.",
        ],
      },
    ],
  },

  // ── PILLAR 3 clusters (comparisons) ───────────────────────────────────────────
  "toast-alternative": {
    lead: "Toast is a full restaurant POS with online ordering attached. It's capable, but ordering is tied to Toast's hardware and monthly software plans, and Toast adds a $0.99 fee per online order (charged to the guest, or absorbed by you). If you want online ordering without the per-order fee and the hardware lock-in, an owned site is the cleaner fit.",
    updated: UPDATED,
    sections: [
      {
        h: "What Toast actually charges",
        body: [
          "Toast's online ordering rides on its POS: monthly software fees, payment processing, and in most configurations that $0.99-per-order guest fee. It's a strong all-in-one if you also want Toast's terminals and want everything under one roof - but you're buying an ecosystem, on a monthly bill, with a fee on each online order.",
        ],
      },
      {
        h: "The honest gap",
        body: [
          "The $0.99 fee is small per order and large over a year of volume, and it's not really the point - the point is that the ordering, the site, and the customer data live inside Toast's platform on a recurring plan. Leave Toast and you leave the ordering behind.",
        ],
      },
      OWNED_ALT("It handles pickup and delivery ordering the same way Toast's online ordering does, without tying you to a POS."),
    ],
  },

  "square-online-ordering-alternative": {
    lead: "Square Online is one of the easiest ways to start taking orders, and its free tier is genuinely useful. The catch is the ceiling: as you grow, real restaurant needs - catering, time-slot scheduling, deeper menu logic - thin out, and you're still paying per-order processing on every sale. For a restaurant that has outgrown the starter store, an owned site removes both limits.",
    updated: UPDATED,
    sections: [
      {
        h: "Where Square is fine - and where it stops",
        body: [
          "For a counter-service spot that wants a simple pickup page, Square Online is hard to beat on ease. But catering workflows, scheduled/time-slot ordering, and more complex menus are where the platform starts to feel like a general-purpose store bolted onto a restaurant rather than something built for one - and every order still carries Square's processing cut.",
        ],
      },
      {
        h: "The honest gap",
        body: [
          "You don't own the storefront - it's a Square site on Square's terms, and the restaurant-specific features you'll want as you grow either aren't there or sit behind higher tiers. It's a great first step, not a long-term home for a serious ordering operation.",
        ],
      },
      OWNED_ALT("Catering, scheduling, and richer menus are built in rather than bolted on, because it's built for restaurants specifically."),
    ],
  },

  "clover-alternative": {
    lead: "Clover is a POS system with online ordering added through its app market. Like Toast, the ordering is tied to Clover's hardware and monthly plans, and getting the setup you want often means stacking paid apps on top. If you want online ordering that isn't chained to a POS and its monthly stack, an owned site is simpler and cheaper over time.",
    updated: UPDATED,
    sections: [
      {
        h: "What Clover actually charges",
        body: [
          "Clover's online ordering depends on your plan and the apps you add from its marketplace - each with its own monthly fee - plus payment processing and, usually, Clover hardware. It works, but the real cost is the sum of the plan, the add-on apps, and the hardware you're locked into.",
        ],
      },
      {
        h: "The honest gap",
        body: [
          "Your ordering is only as portable as the Clover ecosystem allows. Change POS and the online ordering, and the customer data behind it, don't come with you - they were part of Clover, not part of your business.",
        ],
      },
      OWNED_ALT("Ordering runs on your own site independent of any POS or hardware, so it's yours to keep whatever else you change."),
    ],
  },

  "menufy-alternative": {
    lead: "Menufy will build a restaurant an online-ordering page at little or no cost to you - because the model is funded by a convenience fee (around $1.75) charged to your customer on each order, on a site hosted on Menufy's platform. If you'd rather not put a per-order fee in front of your diners on a page you don't own, an owned site is the alternative.",
    updated: UPDATED,
    sections: [
      {
        h: "How Menufy's model works",
        body: [
          "Menufy's pitch is low cost to the restaurant, and that part is real. The trade is that the diner pays a per-order convenience fee, and the ordering page lives on Menufy's platform. You get orders without a big bill; your customer gets a surcharge, and you don't own the storefront it happens on.",
        ],
      },
      {
        h: "The honest gap",
        body: [
          "A fee your customer sees at checkout is friction on your own regulars, and because the page is Menufy's, the site and the relationship aren't things you can pick up and take elsewhere. It's cheap for you precisely because it isn't yours.",
        ],
      },
      OWNED_ALT("There's no diner-facing convenience fee on the order, and the ordering page is your own site, not a hosted page you rent."),
    ],
  },

  "chownow-alternative": {
    lead: "ChowNow gets one big thing right: no commission on orders. But it delivers that as a subscription - published plans around $249-$449/month, a setup fee of roughly $119-$499, and per-order payment processing (about 2.95% + 29¢) on top. If you want the commission-free promise without a monthly subscription, a one-time-cost owned site gets you there.",
    updated: UPDATED,
    sections: [
      {
        h: "What ChowNow actually charges",
        body: [
          "ChowNow removes marketplace commission, which is genuinely valuable. It funds that with a monthly plan (published tiers roughly $249-$449/month), an upfront setup fee, and standard per-order processing. Over a year, that's a few thousand dollars in subscription before a single order's processing - a recurring cost that never ends.",
        ],
      },
      {
        h: "The honest gap",
        body: [
          "The commission-free story is real, but you're renting it. Stop paying the monthly and the ordering goes with it. You've swapped a per-order commission for a per-month subscription - better, but still a bill that runs as long as you're open.",
        ],
      },
      OWNED_ALT("You get the same commission-free ordering, but as a one-time build instead of a monthly subscription plus setup fee."),
    ],
  },

  "bentobox-alternative": {
    lead: "BentoBox makes genuinely beautiful, design-led restaurant websites - on a premium monthly subscription, with online ordering as an added part of the package. If you want a site that looks the part without a premium recurring bill, an owned site delivers the design once, for a one-time price.",
    updated: UPDATED,
    sections: [
      {
        h: "What BentoBox is, and costs",
        body: [
          "BentoBox is at the high end of restaurant website platforms: strong design, a real CMS, and integrated ordering - sold as a premium monthly subscription. For a group that wants a polished brand site and will pay monthly for it indefinitely, it's a legitimate choice.",
        ],
      },
      {
        h: "The honest gap",
        body: [
          "The design is excellent; the model is a subscription. You're paying a premium monthly fee for as long as you want the site, and the site remains BentoBox's platform. The look is yours to enjoy while you pay for it, not to own.",
        ],
      },
      OWNED_ALT("You get a design tailored to your brand and the same integrated ordering, paid once, on a site you own rather than a premium monthly subscription."),
    ],
  },

  "restolabs-alternative": {
    lead: "Restolabs is a commission-free online-ordering platform sold as a monthly subscription - roughly $69 to $199 a month depending on tier, with a branded website and mobile app available as extra monthly add-ons. If you like the commission-free part but not renting it forever, an owned site gives you the same ordering for a one-time price.",
    updated: UPDATED,
    sections: [
      {
        h: "What Restolabs actually charges",
        body: [
          "Restolabs takes no commission and no per-order fee of its own - you pay a flat monthly subscription (around $69 Basic, $99 Growth, $199 Pro) plus your payment processor's fees. A branded website and a mobile app are separate monthly add-ons. It's fair and transparent; it's also a bill that recurs every month you use it.",
        ],
      },
      {
        h: "The honest gap",
        body: [
          "Commission-free is the right instinct, but the subscription means you're renting the ordering - and the website that showcases it is an extra monthly line. Stop paying and it stops working. You never reach a point where it's simply yours.",
        ],
      },
      OWNED_ALT("The website and the commission-free ordering come together in one owned build, instead of a monthly subscription with the site and app billed as add-ons."),
    ],
  },
};

export function getArticle(slug: string): LearnArticle | undefined {
  return LEARN_CONTENT[slug];
}
