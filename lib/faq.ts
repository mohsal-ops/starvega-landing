// Objection-handling content. Shared by the accordion UI and the FAQPage schema
// so the crawlable rich-result content can never drift from what's on screen.
// Order matters - these are sequenced by the doubt most likely to stop a click.

export const FAQS: { q: string; a: string }[] = [
  {
    q: "Is the free preview actually free?",
    a: "Yes. I build a real, working preview of your site with your menu and branding, and you explore it with no payment and no card on file. You only pay if you've seen it and decide to go live.",
  },
  {
    q: "What happens to my data or site if I don't go live?",
    a: "Nothing bad. If you pass, the preview simply comes down. Your menu, photos, and info stay yours. Nothing is sold, shared, or held over you.",
  },
  {
    q: "Why is this cheaper than a typical agency or Toast/Square?",
    a: "Agencies price in overhead and account managers; Toast and Square charge you every month forever. I build each site personally, once, for a one-time price, so there's no monthly middleman to fund.",
  },
  {
    q: "Do I actually own it after?",
    a: "Yes. Once you're live it's your site and your ordering system. No revenue share, no per-order fee, and you're not locked into my platform to keep it running.",
  },
  {
    q: "How long does it take?",
    a: "The preview is usually ready within a few days. Going live after you approve it is quick, and I handle the technical setup with you step by step.",
  },
  {
    q: "What if I already have a website?",
    a: "That's fine. Most restaurant sites can't take an order without handing a commission to an app. This gives you ordering you actually own, and I'll work from whatever you already have.",
  },
];
