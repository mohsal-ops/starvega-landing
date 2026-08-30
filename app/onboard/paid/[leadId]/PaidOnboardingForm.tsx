"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

// Paid onboarding form. Same fields as the builder's /onboard/[slug]
// (story, hours, menu changes, requests, payment-ready, photos) - recreated
// here because it's a different repo. Photos reuse the instant-demo blob route.
// Submits to /api/onboard/paid, which re-checks payment server-side.

type Photo = { key: string; name: string; url?: string; uploading: boolean; error?: string };

export function PaidOnboardingForm({
  leadId,
  businessName,
}: {
  leadId: string;
  businessName: string;
}) {
  const [story, setStory] = useState("");
  const [hoursNote, setHoursNote] = useState("");
  const [menuChanges, setMenuChanges] = useState("");
  const [requests, setRequests] = useState("");
  const [paymentReady, setPaymentReady] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const uploading = photos.some((p) => p.uploading);

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const key = `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`;
      setPhotos((prev) => [...prev, { key, name: file.name, uploading: true }]);
      try {
        const result = await upload(`onboard/${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/instant-demo/upload",
        });
        setPhotos((prev) => prev.map((p) => (p.key === key ? { ...p, url: result.url, uploading: false } : p)));
      } catch (e) {
        setPhotos((prev) =>
          prev.map((p) => (p.key === key ? { ...p, uploading: false, error: (e as Error).message } : p)),
        );
      }
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const removePhoto = (key: string) => setPhotos((prev) => prev.filter((p) => p.key !== key));

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/onboard/paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          story,
          hoursNote,
          menuChanges,
          requests,
          paymentReady,
          photos: photos.filter((p) => p.url).map((p) => p.url),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong saving that.");
      }
      setDone(true);
    } catch (e) {
      setError((e as Error).message || "Something went wrong. Try again, or send it to me by DM.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="mb-2 text-4xl">🎉</div>
        <p className="text-lg font-semibold text-green-800">Got it, thank you!</p>
        <p className="mt-1 text-green-700">
          Payment received and your details are in. We&apos;ll build {businessName} out and
          reach out if we need anything - expect it live in about 7 business days.
        </p>
      </div>
    );
  }

  const label = "block text-sm font-semibold text-ink";
  const hint = "mt-1 text-sm text-ink-soft";
  const field =
    "mt-3 w-full rounded-xl border border-ash bg-white px-3.5 py-2.5 text-ink outline-none focus:border-amber focus:ring-2 focus:ring-amber/20";

  return (
    <div className="space-y-6">
      <header>
        <p className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-amber">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
          Payment received
        </p>
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">Let&apos;s finish your site 🎉</h1>
        <p className="mt-2 text-ink-soft">
          A few quick things to make {businessName} yours. Most of it is optional - anything you
          don&apos;t have handy, skip it and send it later.
        </p>
      </header>

      {/* 1. Story */}
      <section className="rounded-2xl border border-ash bg-white p-5">
        <label className={label} htmlFor="story">Your story</label>
        <p className={hint}>How it started, what makes it special. A couple paragraphs is plenty.</p>
        <textarea id="story" rows={6} value={story} onChange={(e) => setStory(e.target.value)} className={field} placeholder="How it all began…" />
      </section>

      {/* 2. Photos */}
      <section className="rounded-2xl border border-ash bg-white p-5">
        <span className={label}>Photos</span>
        <p className={hint}>Food, your space, your team - upload as many as you&apos;d like.</p>
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
          className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-ash bg-stone-50 px-4 py-8 text-center text-sm text-ink-soft hover:border-amber"
        >
          Drop photos here, or click to choose
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
        {photos.length > 0 && (
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {photos.map((p) => (
              <li key={p.key} className="relative overflow-hidden rounded-lg border border-ash bg-stone-50">
                {p.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.url} alt={p.name} className="h-24 w-full object-cover" />
                ) : (
                  <div className="flex h-24 w-full items-center justify-center text-xs text-ink-soft">
                    {p.error ? "Couldn't upload" : "Uploading…"}
                  </div>
                )}
                <button type="button" onClick={() => removePhoto(p.key)} className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white hover:bg-black/80" aria-label={`Remove ${p.name}`}>✕</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 3. Basics */}
      <section className="space-y-4 rounded-2xl border border-ash bg-white p-5">
        <span className={label}>A few basics</span>
        <div>
          <label className="text-sm text-ink-soft" htmlFor="hours">Any corrections to the hours on your demo?</label>
          <input id="hours" value={hoursNote} onChange={(e) => setHoursNote(e.target.value)} className={field} placeholder="Only if something's off, otherwise leave blank" />
        </div>
        <div>
          <label className="text-sm text-ink-soft" htmlFor="menu">Any menu changes or corrections since the demo?</label>
          <textarea id="menu" rows={3} value={menuChanges} onChange={(e) => setMenuChanges(e.target.value)} className={field} placeholder="New items, price fixes, wrong descriptions…" />
        </div>
        <div>
          <label className="text-sm text-ink-soft" htmlFor="requests">Any special requests?</label>
          <textarea id="requests" rows={3} value={requests} onChange={(e) => setRequests(e.target.value)} className={field} placeholder="Anything else you'd like on the site" />
        </div>
      </section>

      {/* 4. Payment setup */}
      <section className="rounded-2xl border border-ash bg-white p-5">
        <span className={label}>Online ordering setup</span>
        <p className={hint}>
          We&apos;ll personally walk you through connecting your Stripe account - no technical
          steps on your end. Check this and we&apos;ll reach out to set up a quick time.
        </p>
        <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-ash bg-stone-50 p-3.5">
          <input type="checkbox" checked={paymentReady} onChange={(e) => setPaymentReady(e.target.checked)} className="mt-0.5 h-5 w-5 accent-ink" />
          <span className="text-sm text-ink">I&apos;m ready, reach out to set up payments.</span>
        </label>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={submitting || uploading}
        className="w-full rounded-xl bg-amber px-4 py-3 text-base font-semibold text-ink transition-transform hover:bg-[#f0904a] active:scale-[0.99] disabled:opacity-50"
      >
        {submitting ? "Sending…" : uploading ? "Finishing photo upload…" : "Send it over"}
      </button>
      <p className="text-center text-xs text-ink-soft">
        Everything here is optional - send what you have now, the rest whenever.
      </p>
    </div>
  );
}
