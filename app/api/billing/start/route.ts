import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { ensurePlan, foundingSpotsLeft, isPlanKey } from "@/lib/billing";
import { clientIp, rateLimit } from "@/lib/rateLimit";

// POST /api/billing/start  { plan, email, ownerName, restaurantName, phone, city }
// Step 1 of a monthly sign-up: saves what they typed (PendingSignup) and returns
// the PayPal plan id for the Subscribe button. Nothing is charged here; the
// account is only created in /api/billing/activate once PayPal approves.
export const runtime = "nodejs";

const cap = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (!isPlanKey(b.plan) || b.plan === "care") return NextResponse.json({ error: "Pick a plan." }, { status: 400 });
  if (!(await rateLimit(`billing-start:${clientIp(req.headers)}`, 20, 3600))) {
    return NextResponse.json({ error: "Too many tries. Please wait a bit." }, { status: 429 });
  }
  const email = cap(b.email, 120).toLowerCase();
  const restaurantName = cap(b.restaurantName, 80);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a real email. Your login code goes there." }, { status: 400 });
  if (!restaurantName) return NextResponse.json({ error: "Enter your restaurant's name." }, { status: 400 });
  if (b.plan === "founding" && (await foundingSpotsLeft()) <= 0) {
    return NextResponse.json({ error: "The founding partner spots are taken. The Regulars Engine plan is still open." }, { status: 409 });
  }

  try {
    const planId = await ensurePlan(b.plan);
    const signup = await db.pendingSignup.create({
      data: {
        plan: b.plan,
        email,
        restaurantName,
        ownerName: cap(b.ownerName, 80) || null,
        phone: cap(b.phone, 40) || null,
        city: cap(b.city, 60) || null,
      },
    });
    return NextResponse.json({ planId, signupId: signup.id });
  } catch (e) {
    console.error("[billing/start]", e);
    return NextResponse.json({ error: "Checkout isn't available right now. Please try again in a minute." }, { status: 502 });
  }
}
