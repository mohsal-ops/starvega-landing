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
    q: "Do I have to leave DoorDash or Uber Eats?",
    a: "No. Keep them. They are good at finding you new customers. The card in the bag makes sure the next order from that customer comes straight to you instead.",
  },
  {
    q: "What is a bag card?",
    a: "A small card that goes in every delivery and takeout bag. It says \"Loved it? Next time, order straight from us,\" with a QR code and a thank-you offer, like a free drink. I design it with your logo and send you a file any print shop can print.",
  },
  {
    q: "Why would someone order from my site instead of the app?",
    a: "They get your thank-you offer, and often a better price, because you don't pay the app's cut. The QR takes them right to your menu, so it's as easy as the app.",
  },
  {
    q: "What exactly do you do every month?",
    a: "I write and send 2 texts a month to your club, like a slow-night special or a birthday treat. You say ok first. I fix things you ask for, keep your site running, and post a short report in your account.",
  },
  {
    q: "How does the 100-order guarantee work?",
    a: "From the day your site goes live, you have 90 days. If your site doesn't bring you 100 direct orders, I refund your setup and keep working for free until it does. Your part: a card in every bag, the QR on your counter, and an ok on each text within a day.",
  },
  {
    q: "Is there a contract?",
    a: "No. The monthly plans are month to month. You can stop any month from your account. Your site stays up until the end of the month you paid for.",
  },
  {
    q: "What's the difference between the plans?",
    a: "Founding partner and the Regulars Engine are the same service, done for you: site, bag cards, text club and texts. Founding partner is a lower price for the first 5 restaurants. \"Own it\" is the site and ordering, paid once, and you run it yourself.",
  },
  {
    q: "How do I pay, and when?",
    a: "By card or PayPal. Monthly plans charge on the same day each month. You see every receipt in your Starvega account, and you can change your card in PayPal any time.",
  },
  {
    q: "What is my Starvega account?",
    a: "Your own page where you see your site, your plan and bills, how close you are to the 100 orders, every text and change I made, and a box to ask for anything. You sign in with your email. No password to remember.",
  },
  {
    q: "Who gets the texts? Is it legal?",
    a: "Only people who joined your club and said yes. Every text has a way to opt out. You never text anyone who didn't ask for it.",
  },
  {
    q: "Where does the order money go?",
    a: "Straight to your own payment account. I never touch your sales, and there's no fee per order.",
  },
  {
    q: "I use Toast, Square or Clover. Does this work?",
    a: "Yes, keep your register. Website orders ring on your phone and a tablet screen in your kitchen. A Square or Clover link is in early access. It doesn't go into Toast yet, so I'll be clear about that up front.",
  },
  {
    q: "I already pay Owner.com or Popmenu. Why switch?",
    a: "They give you good software that you still run yourself. I do the work for you: the cards, the texts, the Google listing, the changes. And it costs less. They're month to month too, so I move your menu and photos over for free when you're ready.",
  },
  {
    q: "Is the free bag card and sample really free?",
    a: "Yes. Give me your name, your restaurant and a phone number. I make your card and a sample of your site. No payment. No card. If you don't go ahead, I take the sample down and stop messaging you.",
  },
  {
    q: "How long until I'm live?",
    a: "The sample is ready in a day. After you send your basics, most sites go live in about a week. It depends on how fast you send your menu and photos.",
  },
  {
    q: "Who are you?",
    a: "I'm Ben. I build and run every site myself, so the person who builds yours is the same one who answers you every month. You won't get passed to a support team after launch.",
  },
  {
    q: "Are these app fees real?",
    a: "Yes. DoorDash takes 15-30% for delivery. Uber Eats takes 15-30%. Grubhub takes 5-20%, plus more for delivery. I show each one, with the real math, in the full list.",
    href: "/learn/delivery-app-commissions",
    linkText: "See the full commission breakdown",
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

