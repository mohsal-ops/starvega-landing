"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { SITE } from "@/lib/site";
import { track, sessionId } from "@/lib/track-client";

type Photo = { key: string; name: string; url?: string; uploading: boolean; error?: string };
type Result = { id: string | null; businessName: string; photoUrls: string[] };

const TYPES = ["Restaurant", "Cafe", "Food Truck", "Bakery", "Other"];

// Clearly-generic sample items — never a fabricated real menu.
const SAMPLE = [
  { name: "Signature Plate", note: "Your bestseller goes here" },
  { name: "House Favorite", note: "A crowd pleaser" },
  { name: "Fresh Bowl", note: "Made to order" },
  { name: "Side and Drink", note: "Pairs with anything" },
  { name: "Sweet Finish", note: "House dessert" },
];

export default function InstantDemo() {
  const [phase, setPhase] = useState<"form" | "submitting" | "preview">("form");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [contact, setContact] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [opened, setOpened] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploading = photos.some((p) => p.uploading);
  const photoUrls = photos.filter((p) => p.url).map((p) => p.url!) as string[];

  const markOpened = () => {
    if (!opened) {
      setOpened(true);
      track("widget_opened");
    }
  };

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    const room = 5 - photos.length;
    for (const file of Array.from(files).slice(0, room)) {
      const key = `${file.name}-${Math.random().toString(36).slice(2)}`;
      setPhotos((p) => [...p, { key, name: file.name, uploading: true }]);
      try {
        const res = await upload(`instant-demo/${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/instant-demo/upload",
        });
        setPhotos((p) => p.map((x) => (x.key === key ? { ...x, url: res.url, uploading: false } : x)));
      } catch (e) {
        setPhotos((p) => p.map((x) => (x.key === key ? { ...x, uploading: false, error: (e as Error).message } : x)));
      }
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Add your business name first.");
      return;
    }
    setPhase("submitting");
    setError("");
    try {
      const res = await fetch("/api/instant-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: name,
          businessType: type || null,
          contact: contact || null,
          photoUrls,
          company, // honeypot
          sessionId: sessionId(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong.");
      setResult({ id: data.id, businessName: data.businessName || name, photoUrls: data.photoUrls || photoUrls });
      setPhase("preview");
      track("preview_generated");
    } catch (err) {
      setError((err as Error).message);
      setPhase("form");
    }
  };

  const heroImg = result?.photoUrls[0] || "/placeholders/demo-hero.jpg";
  const field = "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-bg placeholder:text-white/40 outline-none focus:border-amber";

  return (
    <section id="cta" className="scroll-mt-20 bg-ink px-6 py-24 text-bg sm:px-10 sm:py-32">
      <div className="mx-auto w-full max-w-3xl">
        {phase !== "preview" ? (
          <>
            <p className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-amber">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
              See it before you decide
            </p>
            <h2 className="text-[clamp(2.25rem,7vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
              Build a preview of your site, right now.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/70">
              Drop your name and a couple photos. You will see a working preview in seconds, no cost and no call.
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              {/* honeypot: hidden from users, catches bots */}
              <div aria-hidden className="absolute left-[-9999px] top-[-9999px]" tabIndex={-1}>
                <label>
                  Company
                  <input value={company} onChange={(e) => setCompany(e.target.value)} tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={name}
                  onFocus={markOpened}
                  onChange={(e) => setName(e.target.value.slice(0, 60))}
                  maxLength={60}
                  required
                  placeholder="Business name"
                  className={field}
                />
                <select value={type} onFocus={markOpened} onChange={(e) => setType(e.target.value)} className={field}>
                  <option value="" className="bg-ink">Business type (optional)</option>
                  {TYPES.map((t) => (
                    <option key={t} value={t} className="bg-ink">{t}</option>
                  ))}
                </select>
              </div>

              {/* photos */}
              <div>
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); markOpened(); addFiles(e.dataTransfer.files); }}
                  className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 px-4 py-6 text-center text-sm text-white/50 hover:border-amber/60"
                >
                  {photos.length >= 5 ? "That is 5 photos, plenty" : "Add photos of your food or space (optional, up to 5)"}
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { markOpened(); addFiles(e.target.files); }} />
                {photos.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {photos.map((p) => (
                      <div key={p.key} className="relative">
                        {p.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                        ) : (
                          <div className="grid h-16 w-16 place-items-center rounded-lg bg-white/10 text-[10px] text-white/40">{p.error ? "error" : "..."}</div>
                        )}
                        <button type="button" onClick={() => setPhotos((x) => x.filter((y) => y.key !== p.key))} className="absolute -right-1 -top-1 rounded-full bg-black/70 px-1.5 text-xs text-white">x</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <input
                value={contact}
                onFocus={markOpened}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Email or Instagram handle, so we can send you this link (optional)"
                className={field}
              />

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={phase === "submitting" || uploading}
                className="w-full rounded-xl bg-amber px-6 py-4 text-base font-semibold text-ink transition-transform hover:bg-[#f0904a] active:scale-[0.99] disabled:opacity-50 sm:w-auto"
              >
                {phase === "submitting" ? "Building your preview..." : uploading ? "Finishing photo upload..." : "Build my preview"}
              </button>
            </form>
          </>
        ) : (
          <Preview businessName={result!.businessName} heroImg={heroImg} />
        )}
      </div>
    </section>
  );
}

// The inline generated preview: a mock site with the business name, sample menu,
// and a working-looking catering form. Business name is rendered via React (auto
// escaped). No real menu is fabricated; items are clearly generic.
function Preview({ businessName, heroImg }: { businessName: string; heroImg: string }) {
  return (
    <div>
      <p className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-amber">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
        Your preview
      </p>

      <div className="overflow-hidden rounded-2xl border border-white/15 bg-white text-ink shadow-2xl">
        {/* fake browser bar */}
        <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="ml-3 truncate font-mono text-[11px] text-ink-soft">{slug(businessName)}.com</span>
        </div>

        {/* hero */}
        <div className="relative h-56 w-full sm:h-72">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImg} alt={`${businessName} preview`} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
            <h3 className="text-[clamp(1.75rem,6vw,2.75rem)] font-bold leading-tight text-white">{businessName}</h3>
            <p className="mt-1 text-sm text-white/80">Order online. No commission. Yours.</p>
          </div>
        </div>

        {/* order online */}
        <div className="p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">Order Online</h4>
            <span className="rounded-full bg-amber/15 px-2.5 py-1 text-[11px] font-medium text-amber-deep">Sample layout</span>
          </div>
          <p className="mt-1 text-xs text-ink-soft">Your real menu and photos go here.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SAMPLE.map((it) => (
              <div key={it.name} className="flex items-center justify-between rounded-xl border border-line p-3">
                <div>
                  <p className="font-medium">{it.name}</p>
                  <p className="text-xs text-ink-soft">{it.note}</p>
                </div>
                <button type="button" className="rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-bg">Add</button>
              </div>
            ))}
          </div>
        </div>

        {/* request catering */}
        <div className="border-t border-line bg-paper p-5 sm:p-7">
          <h4 className="text-lg font-semibold">Request Catering</h4>
          <form onSubmit={(e) => e.preventDefault()} className="mt-3 grid gap-3 sm:grid-cols-2">
            <input placeholder="Your name" className="rounded-lg border border-line px-3 py-2 text-sm" />
            <input placeholder="Date" className="rounded-lg border border-line px-3 py-2 text-sm" />
            <input placeholder="Guests" className="rounded-lg border border-line px-3 py-2 text-sm" />
            <input placeholder="Phone" className="rounded-lg border border-line px-3 py-2 text-sm" />
            <textarea placeholder="What are you planning?" rows={2} className="rounded-lg border border-line px-3 py-2 text-sm sm:col-span-2" />
            <button type="submit" className="rounded-lg bg-amber px-4 py-2 text-sm font-semibold text-ink sm:col-span-2">Request a quote</button>
          </form>
        </div>
      </div>

      {/* go-live CTA */}
      <div className="mt-8 text-center">
        <p className="text-xl font-semibold sm:text-2xl">Want this live with your real menu and photos in 48 hours?</p>
        <a
          href={SITE.instagramDmUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("onboarding_clicked")}
          className="mt-5 inline-flex min-h-[56px] items-center justify-center rounded-xl bg-amber px-8 py-4 text-base font-semibold text-ink transition-transform hover:bg-[#f0904a] active:scale-[0.99]"
        >
          Let us build it for you
        </a>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-white/40">Opens a message on Instagram</p>
      </div>
    </div>
  );
}

function slug(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 30) || "your-restaurant";
}
