// Objection-handling content. Shared by the accordion UI and the FAQPage schema
// so the crawlable rich-result content can never drift from what's on screen.
// Order matters - these are sequenced by the doubt most likely to stop a click.

// `href`/`linkText` are optional: when present, the accordion UI renders a small
// secondary link into /learn under the answer. The FAQPage schema only uses `a`,
// so the answer text stays self-contained and crawlable on its own.
export const FAQS: { q: string; a: string; href?: string; linkText?: string }[] = [
  {
    q: "Is the free mockup actually free?",
    a: "Yes. You give me your name, your restaurant and a number to message, and I design a mockup of your site with your name and menu. No payment, no card. You only pay if you have seen it and want it live.",
  },
  {
    q: "What happens if I don't go ahead?",
    a: "Nothing. The mockup simply comes down and I won't keep messaging you. Your menu, photos and number are never sold or shared.",
  },
  {
    q: "Why is this cheaper than a typical agency or Toast/Square?",
    a: "Agencies price in overhead and account managers; Toast and Square charge you every month forever. I build each site personally, once, for a one-time price, so there's no monthly middleman to fund.",
  },
  {
    q: "How do you know these commission numbers are accurate?",
    a: "They're the platforms' own published 2026 rates, not estimates. DoorDash charges 15-30% on delivery, Uber Eats 15-30%, and Grubhub 5-20% plus an optional delivery cut. I lay out each one tier by tier, with the real per-order math, in the delivery-app commissions breakdown.",
    href: "/learn/delivery-app-commissions",
    linkText: "See the full commission breakdown",
  },
  {
    q: "How does the loyalty club work?",
    a: "Customers opt in at checkout or by scanning a QR code in your restaurant. From your dashboard you can text or email them a special in one tap, birthday offers go out automatically, and every promo code is tracked so you see what it brought in. It is a small monthly add-on that covers the real cost of sending messages, and you can add it to any plan.",
  },
  {
    q: "Do I actually own it after?",
    a: "Yes. Once you're live it's your site and your ordering system. No revenue share, no per-order fee, and you're not locked into my platform to keep it running.",
  },
  {
    q: "How long does it take?",
    a: "The mockup is usually ready within a day or two. Going live after you approve it is quick, and I handle the technical setup with you step by step.",
  },
  {
    q: "What if I already have a website?",
    a: "That's fine. Most restaurant sites can't take an order without handing a commission to an app. This gives you ordering you actually own, and I'll work from whatever you already have.",
  },
];
