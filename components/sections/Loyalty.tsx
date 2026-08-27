import { Reveal } from "@/components/Reveal";

// Loyalty & text-marketing add-on. Truthful capability description only — no
// invented Starvega performance stats (there's no live data yet). Presented as
// the optional paid add-on it is.
const POINTS = [
  {
    title: "Birthday offers, automatic",
    body: "Diners share a birthday once; a treat text goes out a week before, every year, on its own.",
  },
  {
    title: "One-click specials",
    body: "Slow Tuesday? Text every regular a same-day offer from your dashboard in seconds.",
  },
  {
    title: "Automatic re-engagement",
    body: "Turn one-time customers into regulars with the occasional nudge — the kind of repeat business the big apps keep for themselves.",
  },
];

export default function Loyalty() {
  return (
    <section id="loyalty" className="bg-paper px-6 py-24 text-ink sm:px-10 sm:py-32">
      <div className="mx-auto w-full max-w-5xl">
        <p
          data-reveal
          className="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-amber"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
          Optional add-on
        </p>
        <h2
          data-reveal-chars
          className="max-w-3xl text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.02em]"
        >
          Turn one-time diners into regulars.
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink/70">
          Collect a phone number at checkout (only if the customer opts in) and keep your regulars
          coming back with the occasional text. Add it to your site whenever you&apos;re ready.
        </p>

        <div className="mt-14 grid gap-8 sm:mt-20 sm:grid-cols-3">
          {POINTS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.06}>
              <div>
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 leading-relaxed text-ink/70">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mt-12 text-sm leading-relaxed text-ink/60">
          Opt-in only, one tap to unsubscribe — built to the messaging rules, so it stays yours and
          stays compliant.
        </p>
      </div>
    </section>
  );
}
