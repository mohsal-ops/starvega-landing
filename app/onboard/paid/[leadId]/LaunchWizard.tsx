"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { SHOWCASE } from "@/lib/showcase";

// Paid launch wizard: everything needed to build the restaurant's site, in 7
// short steps, from the basics to the extras. On submit the builder creates a
// draft site automatically from it (see builder lib/launchBuild); I review and
// send the client a private review link. Progress is saved in this browser so
// a customer can come back later. Shape must match builder lib/launch.ts.

type Cuisine = "burger" | "pizza" | "coffee" | "bowl" | "grill" | "other";
type Day = { day: number; open: number | null; close: number | null };
type Up = { key: string; name: string; type: string; url?: string; uploading: boolean; error?: string };

type State = {
  name: string;
  cuisine: Cuisine;
  cuisineLabel: string;
  tagline: string;
  instagram: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  hours: Day[];
  design: string;
  color: string;
  logo: Up[];
  menuFiles: Up[];
  menuLink: string;
  menuNotes: string;
  photos: Up[];
  story: string;
  domainMode: "have" | "want" | "later";
  domain: string;
  requests: string;
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const CUISINES: { v: Cuisine; label: string; emoji: string }[] = [
  { v: "burger", label: "Burgers & chicken", emoji: "🍔" },
  { v: "pizza", label: "Pizza & Italian", emoji: "🍕" },
  { v: "coffee", label: "Coffee, café & bakery", emoji: "☕" },
  { v: "bowl", label: "Bowls, healthy, Asian", emoji: "🥗" },
  { v: "grill", label: "Grill, BBQ & kebab", emoji: "🔥" },
  { v: "other", label: "Something else", emoji: "🍽️" },
];
const SWATCHES = ["#e11d48", "#f97316", "#facc15", "#16a34a", "#0ea5e9", "#7c3aed", "#111827", "#92400e"];
const STEPS = ["Restaurant", "Location", "Hours", "Look", "Menu", "Photos", "Finish"];

const hourLabel = (h: number) => (h === 0 || h === 24 ? "12 AM" : h === 12 ? "12 PM" : h < 12 ? `${h} AM` : `${h - 12} PM`);

function initial(p: Props): State {
  return {
    name: p.businessName,
    cuisine: "other",
    cuisineLabel: "",
    tagline: "",
    instagram: "",
    street: "",
    city: p.city || "",
    state: "",
    zip: "",
    phone: p.phone || "",
    email: p.email || "",
    ownerName: p.ownerName || "",
    ownerEmail: p.email || "",
    ownerPhone: p.phone || "",
    hours: DAYS.map((_, d) => ({ day: d, open: 11, close: 21 })),
    design: "classic-starvega",
    color: "",
    logo: [],
    menuFiles: [],
    menuLink: "",
    menuNotes: "",
    photos: [],
    story: "",
    domainMode: "later",
    domain: "",
    requests: "",
  };
}

type Props = {
  leadId: string;
  businessName: string;
  ownerName?: string | null;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  packTier: string;
  packName: string;
};

export function LaunchWizard(props: Props) {
  const { leadId } = props;
  const storeKey = `sv_launch_${leadId}`;
  const [s, setS] = useState<State>(() => initial(props));
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const loaded = useRef(false);
  const top = useRef<HTMLDivElement>(null);

  // restore / save the draft in this browser
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storeKey);
      if (raw) {
        const saved = JSON.parse(raw) as { s: State; step: number };
        const clean = (u: Up[]) => (u || []).filter((x) => x.url).map((x) => ({ ...x, uploading: false }));
        setS({ ...initial(props), ...saved.s, logo: clean(saved.s.logo), menuFiles: clean(saved.s.menuFiles), photos: clean(saved.s.photos) });
        setStep(Math.min(saved.step || 0, STEPS.length - 1));
      }
    } catch {
      /* fresh start */
    }
    loaded.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(storeKey, JSON.stringify({ s, step }));
    } catch {
      /* storage full / blocked - fine */
    }
  }, [s, step, storeKey]);

  const set = <K extends keyof State>(k: K, v: State[K]) => setS((p) => ({ ...p, [k]: v }));
  const uploading = [...s.logo, ...s.menuFiles, ...s.photos].some((u) => u.uploading);

  const addFiles = async (field: "logo" | "menuFiles" | "photos", files: FileList | null, max: number) => {
    if (!files) return;
    const list = Array.from(files).slice(0, Math.max(0, max - (field === "logo" ? 0 : s[field].length)));
    if (field === "logo") set("logo", []);
    for (const file of list) {
      const key = `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`;
      setS((p) => ({ ...p, [field]: [...p[field], { key, name: file.name, type: file.type, uploading: true }] }));
      try {
        const r = await upload(`launch/${leadId}/${field}/${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/onboard/upload",
          clientPayload: JSON.stringify({ leadId }),
        });
        setS((p) => ({ ...p, [field]: p[field].map((u) => (u.key === key ? { ...u, url: r.url, uploading: false } : u)) }));
      } catch (e) {
        setS((p) => ({
          ...p,
          [field]: p[field].map((u) => (u.key === key ? { ...u, uploading: false, error: (e as Error).message || "Upload failed" } : u)),
        }));
      }
    }
  };
  const removeFile = (field: "logo" | "menuFiles" | "photos", key: string) =>
    setS((p) => ({ ...p, [field]: p[field].filter((u) => u.key !== key) }));

  // what each step needs before "Next"
  const missing = (n: number): string => {
    if (n === 0 && !s.name.trim()) return "Add your restaurant's name.";
    if (n === 1) {
      if (!s.street.trim() || !s.city.trim() || !s.state.trim()) return "Add your street, city and state.";
      if (!s.phone.trim()) return "Add the phone number customers should call.";
      if (!/^\S+@\S+\.\S+$/.test(s.ownerEmail.trim())) return "Add your email - it's your dashboard login.";
    }
    if (n === 2 && s.hours.every((h) => h.open == null)) return "Set at least one open day.";
    return "";
  };

  const go = (to: number) => {
    if (to > step) {
      const m = missing(step);
      if (m) return setError(m);
    }
    setError("");
    setStep(to);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submit = async () => {
    for (let i = 0; i < STEPS.length; i++) {
      const m = missing(i);
      if (m) {
        setStep(i);
        return setError(m);
      }
    }
    setSubmitting(true);
    setError("");
    const urls = (u: Up[]) => u.filter((x) => x.url).map((x) => x.url as string);
    const launch = {
      version: 1,
      packTier: props.packTier,
      restaurant: {
        name: s.name.trim(),
        cuisine: s.cuisine,
        cuisineLabel: s.cuisineLabel.trim() || CUISINES.find((c) => c.v === s.cuisine)?.label || "",
        tagline: s.tagline.trim(),
        instagram: s.instagram.trim(),
      },
      contact: {
        street: s.street.trim(),
        city: s.city.trim(),
        state: s.state.trim().toUpperCase(),
        zip: s.zip.trim(),
        phone: s.phone.trim(),
        email: (s.email.trim() || s.ownerEmail.trim()).toLowerCase(),
        ownerEmail: s.ownerEmail.trim().toLowerCase(),
        ownerName: s.ownerName.trim(),
        ownerPhone: s.ownerPhone.trim(),
      },
      hours: s.hours,
      brand: { logoUrl: urls(s.logo)[0] || "", color: s.color },
      design: s.design,
      menu: {
        files: s.menuFiles.filter((x) => x.url).map((x) => ({ url: x.url, type: x.type, name: x.name })),
        link: s.menuLink.trim(),
        notes: s.menuNotes.trim(),
      },
      photos: urls(s.photos),
      story: s.story.trim(),
      domain: { mode: s.domainMode, value: s.domain.trim() },
      requests: s.requests.trim(),
    };
    try {
      const res = await fetch("/api/onboard/paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, launch }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error || "Something went wrong saving that.");
      try {
        localStorage.removeItem(storeKey);
      } catch {}
      setDone(true);
      top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      setError((e as Error).message || "Something went wrong. Try again, or message me.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return <Done name={s.name} />;

  const field =
    "w-full min-h-[48px] rounded-xl border border-ash bg-white px-3.5 text-[16px] text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-ink";
  const label = "mb-1.5 block text-sm font-semibold text-ink";
  const hint = "mt-1 text-xs text-ink-soft";

  return (
    <div ref={top} className="scroll-mt-6">
      <header>
        <p className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-gain">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-gain" /> Payment received · {props.packName}
        </p>
        <h1 className="text-[clamp(1.6rem,5vw,2.2rem)] font-semibold leading-tight tracking-tight">Let&apos;s build {s.name || "your site"}</h1>
        <p className="mt-2 text-ink-soft">7 quick steps. Skip anything you don&apos;t have handy - you can send it later.</p>
      </header>

      {/* progress */}
      <ol className="mt-6 grid grid-cols-7 gap-1.5" aria-label="Steps">
        {STEPS.map((label_, i) => (
          <li key={label_}>
            <button
              type="button"
              onClick={() => (i < step ? go(i) : undefined)}
              className="block w-full text-left"
              aria-current={i === step ? "step" : undefined}
              disabled={i > step}
            >
              <span className={`block h-1.5 rounded-full ${i < step ? "bg-gain" : i === step ? "bg-amber" : "bg-line"}`} />
              <span className={`mt-1.5 hidden text-[11px] sm:block ${i === step ? "font-semibold text-ink" : "text-ink-soft"}`}>{label_}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs text-ink-soft sm:hidden">
        Step {step + 1} of {STEPS.length} · {STEPS[step]}
      </p>

      <div className="mt-6 rounded-2xl border border-line bg-white p-5 sm:p-7">
        {step === 0 && (
          <div className="space-y-5">
            <StepTitle t="Your restaurant" d="The basics customers see first." />
            <div>
              <label className={label} htmlFor="w-name">Restaurant name</label>
              <input id="w-name" className={field} value={s.name} onChange={(e) => set("name", e.target.value)} maxLength={80} />
            </div>
            <div>
              <span className={label}>What do you serve?</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CUISINES.map((c) => (
                  <button
                    key={c.v}
                    type="button"
                    onClick={() => set("cuisine", c.v)}
                    className={`min-h-[52px] rounded-xl border px-3 text-left text-sm transition-colors ${
                      s.cuisine === c.v ? "border-ink bg-paper font-semibold" : "border-line hover:border-ash"
                    }`}
                  >
                    <span className="mr-1.5">{c.emoji}</span>
                    {c.label}
                  </button>
                ))}
              </div>
              <input
                className={`${field} mt-2`}
                value={s.cuisineLabel}
                onChange={(e) => set("cuisineLabel", e.target.value)}
                placeholder="In your words, e.g. Nashville hot chicken, Neapolitan pizza (optional)"
                maxLength={60}
              />
            </div>
            <div>
              <label className={label} htmlFor="w-tag">One line about you <span className="font-normal text-ink-soft">(optional)</span></label>
              <input id="w-tag" className={field} value={s.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="e.g. Houston's crispiest wings since 2015" maxLength={120} />
              <p className={hint}>Leave it empty and I&apos;ll write one.</p>
            </div>
            <div>
              <label className={label} htmlFor="w-ig">Instagram <span className="font-normal text-ink-soft">(optional)</span></label>
              <input id="w-ig" className={field} value={s.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@yourrestaurant" maxLength={60} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <StepTitle t="Location & contact" d="For your site, Google and the map." />
            <div>
              <label className={label} htmlFor="w-street">Street address</label>
              <input id="w-street" className={field} value={s.street} onChange={(e) => set("street", e.target.value)} autoComplete="street-address" maxLength={120} />
            </div>
            <div className="grid grid-cols-[1fr_80px_100px] gap-2">
              <div>
                <label className={label} htmlFor="w-city">City</label>
                <input id="w-city" className={field} value={s.city} onChange={(e) => set("city", e.target.value)} autoComplete="address-level2" maxLength={60} />
              </div>
              <div>
                <label className={label} htmlFor="w-state">State</label>
                <input id="w-state" className={field} value={s.state} onChange={(e) => set("state", e.target.value.toUpperCase().slice(0, 2))} placeholder="TX" autoComplete="address-level1" />
              </div>
              <div>
                <label className={label} htmlFor="w-zip">ZIP</label>
                <input id="w-zip" className={field} value={s.zip} onChange={(e) => set("zip", e.target.value)} inputMode="numeric" autoComplete="postal-code" maxLength={10} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={label} htmlFor="w-phone">Restaurant phone</label>
                <input id="w-phone" className={field} value={s.phone} onChange={(e) => set("phone", e.target.value)} type="tel" maxLength={30} />
                <p className={hint}>Shown on the site.</p>
              </div>
              <div>
                <label className={label} htmlFor="w-pemail">Public email <span className="font-normal text-ink-soft">(optional)</span></label>
                <input id="w-pemail" className={field} value={s.email} onChange={(e) => set("email", e.target.value)} type="email" maxLength={120} />
                <p className={hint}>For catering requests & the contact page.</p>
              </div>
            </div>
            <div className="rounded-xl bg-paper p-4">
              <p className="text-sm font-semibold">Your dashboard login</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-ink-soft" htmlFor="w-oemail">Your email</label>
                  <input id="w-oemail" className={field} value={s.ownerEmail} onChange={(e) => set("ownerEmail", e.target.value)} type="email" autoComplete="email" maxLength={120} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-ink-soft" htmlFor="w-ophone">Your phone / WhatsApp</label>
                  <input id="w-ophone" className={field} value={s.ownerPhone} onChange={(e) => set("ownerPhone", e.target.value)} type="tel" maxLength={30} />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <StepTitle t="Opening hours" d="Your site shows 'Open now' / 'Closed' from these. You can change them anytime." />
            <div className="divide-y divide-line">
              {s.hours.map((h, i) => (
                <div key={h.day} className="flex flex-wrap items-center gap-2 py-2.5">
                  <span className="w-24 text-sm font-medium">{DAYS[h.day]}</span>
                  <label className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={h.open != null}
                      onChange={(e) =>
                        set("hours", s.hours.map((x, j) => (j === i ? (e.target.checked ? { ...x, open: 11, close: 21 } : { ...x, open: null, close: null }) : x)))
                      }
                      className="h-4 w-4 accent-[var(--color-ink)]"
                    />
                    Open
                  </label>
                  {h.open != null ? (
                    <span className="ml-auto flex items-center gap-1.5 text-sm">
                      <HourSelect value={h.open} min={0} max={23} onChange={(v) => set("hours", s.hours.map((x, j) => (j === i ? { ...x, open: v, close: Math.max(x.close ?? v + 1, v + 1) } : x)))} />
                      to
                      <HourSelect value={h.close ?? 21} min={(h.open ?? 0) + 1} max={24} onChange={(v) => set("hours", s.hours.map((x, j) => (j === i ? { ...x, close: v } : x)))} />
                    </span>
                  ) : (
                    <span className="ml-auto text-sm text-ink-soft">Closed</span>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => set("hours", s.hours.map((x) => ({ ...x, open: s.hours[1].open, close: s.hours[1].close })))}
              className="text-sm font-medium underline underline-offset-4"
            >
              Same as Monday, every day
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <StepTitle t="Your look" d="Pick a design - your logo, colour, photos and menu go into it. You can switch designs later." />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SHOWCASE.map((x) => (
                <button
                  key={x.key}
                  type="button"
                  onClick={() => set("design", x.theme)}
                  className={`overflow-hidden rounded-xl border-2 text-left transition-colors ${s.design === x.theme ? "border-ink" : "border-transparent hover:border-ash"}`}
                >
                  <span className="relative block aspect-[360/560] overflow-hidden bg-paper">
                    <Image src={`/showcase/${x.key}-m.webp`} alt="" fill sizes="160px" className="object-cover object-top" />
                    {s.design === x.theme && (
                      <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-ink text-xs text-white">✓</span>
                    )}
                  </span>
                  <span className="block px-2 py-2">
                    <span className="block text-sm font-semibold">{x.style}</span>
                    <span className="block truncate text-[11px] text-ink-soft">like {x.name}</span>
                  </span>
                </button>
              ))}
            </div>

            <div>
              <span className={label}>Logo</span>
              <FilePicker accept="image/*" onFiles={(f) => addFiles("logo", f, 1)} label={s.logo.length ? "Replace logo" : "Upload your logo"} />
              <Files list={s.logo} onRemove={(k) => removeFile("logo", k)} />
              <p className={hint}>PNG with a transparent background is best. No logo yet? Skip it and we&apos;ll sort it out together.</p>
            </div>

            <div>
              <span className={label}>Brand colour</span>
              <div className="flex flex-wrap items-center gap-2">
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set("color", c)}
                    aria-label={`Colour ${c}`}
                    className={`h-9 w-9 rounded-full ring-offset-2 transition-transform hover:scale-110 ${s.color === c ? "ring-2 ring-ink" : "ring-1 ring-black/10"}`}
                    style={{ background: c }}
                  />
                ))}
                <label className="flex h-9 items-center gap-2 rounded-full border border-line px-3 text-sm">
                  <input type="color" value={s.color || "#f97316"} onChange={(e) => set("color", e.target.value)} className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0" />
                  Custom
                </label>
                <button type="button" onClick={() => set("color", "")} className={`h-9 rounded-full border px-3 text-sm ${!s.color ? "border-ink font-semibold" : "border-line"}`}>
                  Match my logo
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <StepTitle t="Your menu" d="Photos of your menu, a PDF, or screenshots from DoorDash / Uber Eats - I turn it into your online menu with prices." />
            <div>
              <FilePicker accept="image/*,application/pdf" multiple onFiles={(f) => addFiles("menuFiles", f, 12)} label="Upload menu photos or PDF" />
              <Files list={s.menuFiles} onRemove={(k) => removeFile("menuFiles", k)} />
              <p className={hint}>Make sure prices are readable. Up to 12 files.</p>
            </div>
            <div>
              <label className={label} htmlFor="w-mlink">Or a link to your menu <span className="font-normal text-ink-soft">(optional)</span></label>
              <input id="w-mlink" className={field} value={s.menuLink} onChange={(e) => set("menuLink", e.target.value)} placeholder="https://www.doordash.com/store/…" maxLength={300} />
            </div>
            <div>
              <label className={label} htmlFor="w-mnotes">Anything to change from that menu? <span className="font-normal text-ink-soft">(optional)</span></label>
              <textarea id="w-mnotes" rows={3} className={`${field} py-3`} value={s.menuNotes} onChange={(e) => set("menuNotes", e.target.value)} placeholder="New prices, items to drop, specials, combos…" maxLength={2000} />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <StepTitle t="Photos & your story" d="Real photos sell more than anything. Phone photos are fine." />
            <div>
              <span className={label}>Food & place photos</span>
              <FilePicker accept="image/*" multiple onFiles={(f) => addFiles("photos", f, 15)} label="Upload photos" />
              <Files list={s.photos} onRemove={(k) => removeFile("photos", k)} thumbs />
              <p className={hint}>Your best dishes, the counter, the team. Up to 15.</p>
            </div>
            <div>
              <label className={label} htmlFor="w-story">Your story <span className="font-normal text-ink-soft">(optional)</span></label>
              <textarea id="w-story" rows={5} className={`${field} py-3`} value={s.story} onChange={(e) => set("story", e.target.value)} placeholder="How it started, who's behind it, what makes your food different…" maxLength={4000} />
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <StepTitle t="Last bits" d="Then I start building." />
            <div>
              <span className={label}>Your web address (domain)</span>
              <div className="grid gap-2 sm:grid-cols-3">
                {([
                  ["have", "I already have one"],
                  ["want", "I want a new one"],
                  ["later", "Decide later"],
                ] as const).map(([v, l]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => set("domainMode", v)}
                    className={`min-h-[48px] rounded-xl border px-3 text-sm ${s.domainMode === v ? "border-ink bg-paper font-semibold" : "border-line hover:border-ash"}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              {s.domainMode !== "later" && (
                <input
                  className={`${field} mt-2`}
                  value={s.domain}
                  onChange={(e) => set("domain", e.target.value)}
                  placeholder={s.domainMode === "have" ? "yourrestaurant.com" : "The name you'd like, e.g. joespizzahouston.com"}
                  maxLength={120}
                />
              )}
            </div>
            <div>
              <label className={label} htmlFor="w-req">Anything else I should know? <span className="font-normal text-ink-soft">(optional)</span></label>
              <textarea id="w-req" rows={4} className={`${field} py-3`} value={s.requests} onChange={(e) => set("requests", e.target.value)} placeholder="Catering, gift cards, a special section, a site you love…" maxLength={3000} />
            </div>

            <div className="rounded-xl bg-paper p-4 text-sm">
              <p className="font-semibold">What happens next</p>
              <ol className="mt-2 space-y-1.5 text-ink-soft">
                <li>1. I build your site from this - usually within a day or two.</li>
                <li>2. You get a private link to look at it and your dashboard login.</li>
                <li>3. You approve it or tell me what to change, connect your Stripe (2 minutes), and we go live.</li>
              </ol>
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-5 rounded-xl bg-loss/10 px-4 py-3 text-sm text-loss">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button type="button" onClick={() => go(step - 1)} className="min-h-[48px] rounded-xl border border-line px-5 text-sm font-semibold hover:border-ash">
              Back
            </button>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => go(step + 1)} className="min-h-[52px] rounded-xl bg-ink px-7 text-[15px] font-semibold text-white hover:bg-black">
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting || uploading}
              className="min-h-[52px] rounded-xl bg-amber px-7 text-[15px] font-semibold text-ink hover:bg-[#f0904a] disabled:opacity-60"
            >
              {uploading ? "Uploading…" : submitting ? "Sending…" : "Build my site"}
            </button>
          )}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-ink-soft">Your answers are saved on this device - you can close this and come back.</p>
    </div>
  );
}

function StepTitle({ t, d }: { t: string; d: string }) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">{t}</h2>
      <p className="mt-1 text-sm text-ink-soft">{d}</p>
    </div>
  );
}

function HourSelect({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  const opts = [];
  for (let h = min; h <= max; h++) opts.push(h);
  return (
    <select value={value} onChange={(e) => onChange(Number(e.target.value))} className="min-h-[40px] rounded-lg border border-ash bg-white px-2 text-sm">
      {opts.map((h) => (
        <option key={h} value={h}>
          {hourLabel(h)}
        </option>
      ))}
    </select>
  );
}

function FilePicker({ accept, multiple = false, onFiles, label }: { accept: string; multiple?: boolean; onFiles: (f: FileList | null) => void; label: string }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="flex min-h-[64px] w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ash bg-paper text-sm font-semibold text-ink hover:border-ink"
      >
        <span aria-hidden className="text-lg">＋</span> {label}
      </button>
    </>
  );
}

function Files({ list, onRemove, thumbs = false }: { list: Up[]; onRemove: (key: string) => void; thumbs?: boolean }) {
  if (!list.length) return null;
  return (
    <ul className={thumbs ? "mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6" : "mt-3 space-y-1.5"}>
      {list.map((u) =>
        thumbs ? (
          <li key={u.key} className="relative aspect-square overflow-hidden rounded-lg border border-line bg-paper">
            {u.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={u.url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="grid h-full place-items-center p-1 text-center text-[10px] text-ink-soft">{u.error ? "Failed" : "Uploading…"}</span>
            )}
            <button type="button" onClick={() => onRemove(u.key)} aria-label={`Remove ${u.name}`} className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-[10px] text-white">
              ✕
            </button>
          </li>
        ) : (
          <li key={u.key} className="flex items-center justify-between gap-2 rounded-lg bg-paper px-3 py-2 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              {u.url && u.type.startsWith("image/") && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={u.url} alt="" className="h-8 w-8 shrink-0 rounded object-cover" />
              )}
              <span className="truncate">{u.name}</span>
              <span className={`shrink-0 text-xs ${u.error ? "text-loss" : u.url ? "text-gain" : "text-ink-soft"}`}>
                {u.error ? u.error : u.url ? "✓" : "uploading…"}
              </span>
            </span>
            <button type="button" onClick={() => onRemove(u.key)} className="shrink-0 text-xs text-ink-soft underline">
              remove
            </button>
          </li>
        ),
      )}
    </ul>
  );
}

function Done({ name }: { name: string }) {
  return (
    <div className="rounded-2xl border border-gain/30 bg-gain/5 p-8 text-center">
      <div className="mb-3 text-4xl">🚀</div>
      <h1 className="text-2xl font-semibold tracking-tight">{name || "Your site"} is being built</h1>
      <p className="mx-auto mt-3 max-w-md text-ink-soft">
        I&apos;ve got everything. You&apos;ll get a private link to see your site and your dashboard login - usually within a
        day or two. Then you approve it or tell me what to change.
      </p>
      <p className="mx-auto mt-4 max-w-md text-sm text-ink-soft">
        One thing you can do now: if you don&apos;t have a Stripe account yet, create one free at stripe.com - that&apos;s
        how card payments reach your bank.
      </p>
    </div>
  );
}
