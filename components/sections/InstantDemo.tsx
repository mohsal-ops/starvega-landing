"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { track, sessionId } from "@/lib/track-client";
import { getEntryPoint } from "@/lib/widget-cta";
import { CUISINE_OPTIONS } from "@/lib/demo/cuisines";
import type { DemoConfig } from "@/lib/demo/generate";
import { DemoPreview } from "@/components/demo/DemoPreview";

type Photo = { key: string; name: string; url?: string; uploading: boolean; error?: string };

export default function InstantDemo() {
  const [phase, setPhase] = useState<"form" | "submitting" | "preview">("form");
  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [city, setCity] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState("");
  const [config, setConfig] = useState<DemoConfig | null>(null);
  const [opened, setOpened] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploading = photos.some((p) => p.uploading);
  const photoUrls = photos.filter((p) => p.url).map((p) => p.url!) as string[];

  const markOpened = () => {
    if (!opened) { setOpened(true); track("widget_opened", { entryPoint: getEntryPoint() }); }
  };

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files).slice(0, 5 - photos.length)) {
      const key = `${file.name}-${Math.random().toString(36).slice(2)}`;
      setPhotos((p) => [...p, { key, name: file.name, uploading: true }]);
      try {
        const res = await upload(`instant-demo/${file.name}`, file, { access: "public", handleUploadUrl: "/api/instant-demo/upload" });
        setPhotos((p) => p.map((x) => (x.key === key ? { ...x, url: res.url, uploading: false } : x)));
      } catch (e) {
        setPhotos((p) => p.map((x) => (x.key === key ? { ...x, uploading: false, error: (e as Error).message } : x)));
      }
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Add your business name first."); return; }
    setPhase("submitting");
    setError("");
    try {
      const res = await fetch("/api/instant-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: name, cuisineKey: cuisine || "other", city: city || null, photoUrls, company, sessionId: sessionId() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok || !data.config) throw new Error(data.error || "Something went wrong.");
      setConfig(data.config);
      setPhase("preview");
    } catch (err) {
      setError((err as Error).message);
      setPhase("form");
    }
  };

  const field = "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-bg placeholder:text-white/40 outline-none focus:border-amber";

  return (
    <section id="cta" className="scroll-mt-20 bg-ink px-6 py-24 text-bg sm:px-10 sm:py-32">
      <div className={`mx-auto w-full ${phase === "preview" ? "max-w-5xl" : "max-w-3xl"}`}>
        {phase !== "preview" ? (
          <>
            <p className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-amber">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
              See it before you decide
            </p>
            <h2 className="text-[clamp(2.25rem,7vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
              Build a real preview of your site, right now.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/70">
              Name, cuisine, and a couple photos. You will get a working site to click through, menu and catering included. No cost, no signup.
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <div aria-hidden className="absolute left-[-9999px] top-[-9999px]" tabIndex={-1}>
                <label>Company<input value={company} onChange={(e) => setCompany(e.target.value)} tabIndex={-1} autoComplete="off" /></label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <input id="instant-demo-name" value={name} onFocus={markOpened} onChange={(e) => setName(e.target.value.slice(0, 60))} maxLength={60} required placeholder="Business name" className={field} />
                <select value={cuisine} onFocus={markOpened} onChange={(e) => setCuisine(e.target.value)} className={field}>
                  <option value="" className="bg-ink">Cuisine / type (optional)</option>
                  {CUISINE_OPTIONS.map((o) => <option key={o.value} value={o.value} className="bg-ink">{o.label}</option>)}
                </select>
              </div>

              <input value={city} onFocus={markOpened} onChange={(e) => setCity(e.target.value)} placeholder="City (optional)" className={field} />

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

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button type="submit" disabled={phase === "submitting" || uploading} className="w-full rounded-xl bg-amber px-6 py-4 text-base font-semibold text-ink transition-transform hover:bg-[#f0904a] active:scale-[0.99] disabled:opacity-50 sm:w-auto">
                {phase === "submitting" ? "Building your site..." : uploading ? "Finishing photo upload..." : "Build my preview"}
              </button>
            </form>
          </>
        ) : (
          config && (
            <>
              <p className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-amber">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
                Your preview. Click around, open the menu and catering.
              </p>
              <DemoPreview config={config} />
            </>
          )
        )}
      </div>
    </section>
  );
}
