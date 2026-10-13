// Objection-handling content. Shared by the accordion UI and the FAQPage schema
// so the crawlable rich-result content can never drift from what's on screen.
// Order matters - these are sequenced by the doubt most likely to stop a click.

// `href`/`linkText` are optional: when present, the accordion UI renders a small
// secondary link into /learn under the answer. The FAQPage schema only uses `a`,
// so the answer text stays self-contained and crawlable on its own.
import { isLive, type FeatureKey } from "./features";

// `feature`: the entry only shows while that feature isn't hidden in lib/features.ts.
type Faq = { q: string; a: string; href?: string; linkText?: string; feature?: FeatureKey };

const ALL_FAQS: Faq[] = [
  {
    q: "Is the free mockup actually free?",
    a: "Yes. Give me your name, your restaurant and a phone number. I make a sample of your site with your name and menu. No payment. No card. You only pay if you see it and want it.",
  },
  {
    q: "What happens if I don't go ahead?",
    a: "Nothing. I take the sample down and stop messaging you. I never sell or share your menu, photos or number.",
  },
  {
    q: "Why does this cost less than an agency or Toast/Square?",
    a: "Agencies pay for big offices and lots of staff. Toast and Square charge you every month, forever. I build each site myself and you pay once. Care is free the first year, then $39 a month. Cancel any time and keep your site. No commission. No cut of each order.",
  },
  {
    q: "Are these app fees real?",
    a: "Yes. They are the apps' own 2026 prices. DoorDash takes 15-30% for delivery. Uber Eats takes 15-30%. Grubhub takes 5-20%, plus more for delivery. I show each one, with the real math, in the full list.",
    href: "/learn/delivery-app-commissions",
    linkText: "See the full commission breakdown",
  },
  {
    feature: "loyalty_sms",
    q: "How does the loyalty club work?",
    a: "Customers join at checkout, or by scanning a code in your restaurant. From your dashboard, you text or email them a deal with one tap. Birthday treats go out on their own. Each deal has a code, so you see what it made. It costs a little each month, just to cover the texts. You can add it to any plan.",
  },
  {
    q: "Is it really mine?",
    a: "Yes. Once it's live, it's your site and your ordering. No cut of your sales. No fee per order. You are not locked in.",
  },
  {
    q: "How long does it take?",
    a: "The sample is ready in a day or two. After you say yes, going live is quick. I do the tech work with you, step by step.",
  },
  {
    q: "What if I already have a website?",
    a: "That's fine. Most restaurant sites can't take an order without sending it to an app that takes a cut. This gives you ordering that is yours. I'll start from what you have.",
  },
];

// Hidden until the matching feature is live (see lib/features.ts).
ALL_FAQS.push(
  {
    feature: "pos_square",
    q: "Do website orders go into my Square POS?",
    a: "Yes. Once you connect Square, every paid website order lands in Square as a paid ticket, and your menu and sold-out items come from Square.",
    href: "/learn/online-ordering-for-square-restaurants",
    linkText: "How it works with Square",
  },
  {
    feature: "pos_clover",
    q: "Do website orders print on my Clover?",
    a: "Yes. Once you connect Clover, every paid website order is created in Clover and prints in your kitchen.",
    href: "/learn/online-ordering-for-clover-restaurants",
    linkText: "How it works with Clover",
  },
);

/** What the page and the FAQPage schema show: only entries whose feature is visible. */
// FAQ answers state facts ("yes, it does X"), so they need a LIVE feature;
// "soon" (early access) is not enough to answer yes.
export const FAQS: Faq[] = ALL_FAQS.filter((f) => !f.feature || isLive(f.feature));

