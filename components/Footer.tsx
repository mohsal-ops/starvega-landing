import Image from "next/image";
import { SITE } from "@/lib/site";

// Minimal footer: logo, the same Instagram contact the CTA routes to (kept
// consistent), and the copyright line. No link wall, no showcase — matches the
// page's uncluttered register.
export default function Footer() {
  return (
    <footer className="border-t border-line bg-bg px-6 py-12 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <Image src="/starvega.png" alt="Starvega" width={150} height={50} className="h-6 w-auto" />

        <a
          href={SITE.instagramDmUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-ink transition-colors hover:text-amber-deep"
        >
          Message me on Instagram &#8594;
        </a>

        <p className="text-xs text-ink-soft">{SITE.footer.copyright}</p>
      </div>
    </footer>
  );
}
