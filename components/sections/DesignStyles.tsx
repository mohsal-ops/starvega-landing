import { Reveal } from "@/components/Reveal";

// "One system, many looks" — shows the funnel visitor that Starvega ships in a
// few distinct design styles, WITHOUT turning it into another decision to sweat.
// The frame is optionality + trust: the look changes, the system underneath
// (commission-free ordering, catering, loyalty, local visibility) never does.
// Monochrome-on-white OFF+BRAND system; each style card previews its OWN palette
// via inline colors so the range reads at a glance. Mirrors the real template
// themes (burnin-bird/src/lib/themes) — keep these in sync if the themes change.

type Style = {
  name: string;
  vibe: string;
  bg: string;
  primary: string;
  ink: string;
  text: string;
  label: { transform: "uppercase" | "none"; tracking: string; weight: number; family: string };
};

const STYLES: Style[] = [
  {
    name: "Classic",
    vibe: "Clean and versatile — fits almost anyone.",
    bg: "#ffffff",
    primary: "#f97316",
    ink: "#111827",
    text: "#111827",
    label: { transform: "none", tracking: "0", weight: 700, family: "var(--font-sans, system-ui)" },
  },
  {
    name: "Smash & Bold",
    vibe: "Loud, urban, late-night.",
    bg: "#eef1f0",
    primary: "#b89976",
    ink: "#111315",
    text: "#111315",
    label: { transform: "uppercase", tracking: "-0.03em", weight: 700, family: "var(--font-sans, system-ui)" },
  },
  {
    name: "Diner Classic",
    vibe: "Warm, retro comfort.",
    bg: "#f9f4ed",
    primary: "#fcb931",
    ink: "#3b2517",
    text: "#3b2517",
    label: { transform: "none", tracking: "-0.01em", weight: 700, family: "var(--font-sans, system-ui)" },
  },
  {
    name: "Refined Elegant",
    vibe: "Upscale and understated.",
    bg: "#ffffff",
    primary: "#ffd469",
    ink: "#0f0606",
    text: "#333333",
    label: { transform: "uppercase", tracking: "0.14em", weight: 400, family: "Georgia, serif" },
  },
];

export default function DesignStyles() {
  return (
    <section id="design-styles" className="bg-bg px-6 py-24 text-ink sm:px-10 sm:py-32">
      <div className="mx-auto w-full max-w-6xl">
        <p data-reveal className="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-amber">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
          One system, many looks
        </p>
        <h2 data-reveal-chars className="max-w-2xl text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
          Pick the look. Keep the system.
        </h2>
        <p data-reveal-words className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
          Your site comes in a handful of distinct styles — from loud and late-night to warm and
          refined. Choose the one that fits your brand. Everything underneath stays exactly the same.
        </p>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STYLES.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.06}>
              <div className="overflow-hidden rounded-2xl border border-line bg-paper">
                {/* Mini preview in the style's OWN palette */}
                <div className="relative flex h-28 items-center justify-center px-4" style={{ backgroundColor: s.bg }}>
                  <span
                    style={{
                      color: s.text,
                      textTransform: s.label.transform,
                      letterSpacing: s.label.tracking,
                      fontWeight: s.label.weight,
                      fontFamily: s.label.family,
                    }}
                    className="text-lg"
                  >
                    {s.name}
                  </span>
                  <span className="absolute bottom-3 right-3 flex gap-1.5">
                    <span className="h-4 w-4 rounded-full ring-1 ring-black/10" style={{ backgroundColor: s.primary }} />
                    <span className="h-4 w-4 rounded-full ring-1 ring-black/10" style={{ backgroundColor: s.ink }} />
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-ink">{s.name}</p>
                  <p className="mt-1 text-sm leading-snug text-ink-soft">{s.vibe}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-10 max-w-2xl text-base leading-relaxed text-ink-soft">
            <span className="font-semibold text-ink">Same product, every style:</span> commission-free
            direct ordering, catering, loyalty, and getting found on local search don&apos;t change based
            on the design you pick. The look is yours to choose — the results are built in.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
