import Link from "next/link";

// Shared layout for Starvega's legal pages (/terms, /privacy).
export const LEGAL_UPDATED = "October 13, 2026";

export function LegalDoc({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="bg-bg px-4 pb-20 pt-28 text-ink sm:px-6">
      <article className="mx-auto max-w-3xl">
        <p className="text-sm text-ink-soft">Last updated {LEGAL_UPDATED}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <div className="mt-8 space-y-8 text-[15px] leading-relaxed [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_li]:text-ink-soft [&_p]:text-ink-soft [&_ul]:space-y-1.5">
          {children}
        </div>
        <nav className="mt-14 flex gap-5 border-t border-line pt-6 text-sm">
          <Link href="/terms" className="underline underline-offset-4">Terms of Service</Link>
          <Link href="/privacy" className="underline underline-offset-4">Privacy Policy</Link>
          <Link href="/" className="underline underline-offset-4">Home</Link>
        </nav>
      </article>
    </main>
  );
}
