import { NextRequest, NextResponse } from "next/server";
import { geolocation } from "@vercel/functions";
import db from "@/lib/db";
import { sendOwnerMail } from "@/lib/mail";
import { isPackTier, PACKS_BY_TIER, formatUsd } from "@/lib/pricing";

// POST /api/pack-checkout  { tier, businessName?, contact?, sessionId? }
// A prospect chose a pack. We create a lead carrying the chosen tier, record a
// pack_selected event (feeds the admin funnel + digest), notify the owner by
// email, and return the leadId so the client can go straight to /checkout/[id].
// The price is NEVER taken from here - checkout/create-order derive it from the
// tier via lib/pricing, server-side.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => ({}))) as {
    tier?: string;
    businessName?: string;
    contact?: string;
    sessionId?: string;
  };

  if (!isPackTier(b.tier)) {
    return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
  }
  const pack = PACKS_BY_TIER[b.tier];
  const businessName = (b.businessName || "").trim() || `${pack.label} plan`;
  const contact = (b.contact || "").trim() || null;
  const geo = geolocation(req);

  try {
    const lead = await db.instantDemoLead.create({
      data: {
        businessName,
        contact,
        packTier: pack.tier,
        sessionId: b.sessionId || null,
        country: geo.country || null,
        city: geo.city ? decodeURIComponent(geo.city) : null,
        status: "new",
      },
    });

    // Funnel event (admin dashboard + digest). Best-effort; never blocks checkout.
    if (b.sessionId) {
      await db.pageEvent
        .create({
          data: {
            sessionId: b.sessionId,
            eventType: "pack_selected",
            sectionId: pack.tier.toLowerCase(),
            path: "/",
            country: geo.country || null,
            city: geo.city ? decodeURIComponent(geo.city) : null,
          },
        })
        .catch(() => {});
    }

    // Immediate owner notification (best-effort).
    sendOwnerMail(
      `Starvega: ${pack.label} plan chosen (${formatUsd(pack.price)})`,
      [
        `A prospect chose the ${pack.label} plan (${formatUsd(pack.price)}).`,
        contact ? `Contact: ${contact}` : `Contact: (not provided yet)`,
        `Business: ${businessName}`,
        geo.city || geo.country ? `Location: ${[geo.city, geo.country].filter(Boolean).join(", ")}` : "",
        `Lead: ${lead.id}`,
        ``,
        `They're being sent to checkout now - you'll get the paid confirmation if they complete it.`,
      ]
        .filter(Boolean)
        .join("\n"),
    ).catch(() => {});

    return NextResponse.json({ ok: true, leadId: lead.id });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message || "Could not start checkout." },
      { status: 500 },
    );
  }
}
