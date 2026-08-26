import Image from "next/image";

// Editorial image frame: sharp 0px corners, hairline border, image scaled a touch
// so the caller's data-parallax can drift it inside the mask without exposing an
// edge. Lazy-loaded (everything using this sits below the hero).
export function Figure({
  src,
  alt,
  caption,
  ratio = "4 / 3",
  onInk = false,
  objectPosition = "center",
  className = "",
}: {
  src: string;
  alt: string;
  caption?: string;
  ratio?: string;
  onInk?: boolean;
  objectPosition?: string;
  className?: string;
}) {
  return (
    <figure data-reveal className={className}>
      <div
        className={`relative overflow-hidden border ${onInk ? "border-white/15" : "border-ash"}`}
        style={{ aspectRatio: ratio }}
      >
        <div data-parallax className="absolute inset-0 scale-[1.12]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 45vw"
            className="object-cover"
            style={{ objectPosition }}
            loading="lazy"
          />
        </div>
      </div>
      {caption && (
        <figcaption
          className={`mt-3 font-mono text-[11px] uppercase tracking-[0.18em] ${onInk ? "text-white/50" : "text-ink-soft"}`}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
