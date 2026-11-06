"use server";

import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { syncSubscription } from "@/lib/billing";
import { sendMail } from "@/lib/mail";
import { SITE } from "@/lib/site";

const KINDS = ["campaign", "report", "site", "card", "google", "note"];
const SITE_STATUSES = ["onboarding", "building", "review", "live"];
const dash = () => `${SITE.url.replace(/\/$/, "")}/account`;
const done = () => revalidatePath("/admin/clients");

/** Post work done for a client (shows on their dashboard). Optional email. */
export async function addUpdate(input: { accountId: string; kind: string; title: string; body?: string; metric?: string; notify?: boolean }) {
  await requireAuth();
  if (!KINDS.includes(input.kind) || !input.title.trim()) return { ok: false as const, error: "Pick a type and write a title." };
  const acc = await db.account.findUnique({ where: { id: input.accountId } });
  if (!acc) return { ok: false as const, error: "Client not found." };
  await db.clientUpdate.create({
    data: { accountId: acc.id, kind: input.kind, title: input.title.trim().slice(0, 200), body: input.body?.trim() || null, metric: input.metric?.trim() || null },
  });
  if (input.notify) {
    await sendMail(acc.email, `Update for ${acc.restaurantName}: ${input.title.trim()}`, `${input.title.trim()}\n${input.metric ? `\n${input.metric}\n` : ""}${input.body ? `\n${input.body.trim()}\n` : ""}\nSee everything: ${dash()}\n\nBen, Starvega`).catch(() => false);
  }
  done();
  return { ok: true as const };
}

/** Site status, links, guarantee numbers and notes for a client. */
export async function updateAccount(accountId: string, patch: {
  siteStatus?: string; siteUrl?: string; builderSlug?: string; directOrders?: number; guaranteeStart?: string | null; bagCardCode?: string; notes?: string; email?: string; restaurantName?: string; phone?: string;
}) {
  await requireAuth();
  const data: Record<string, unknown> = {};
  if (patch.siteStatus && SITE_STATUSES.includes(patch.siteStatus)) {
    data.siteStatus = patch.siteStatus;
    // Going live starts the guarantee clock (unless it was set already).
    if (patch.siteStatus === "live") {
      const acc = await db.account.findUnique({ where: { id: accountId }, select: { guaranteeStart: true } });
      if (!acc?.guaranteeStart) data.guaranteeStart = new Date();
    }
  }
  if (patch.siteUrl !== undefined) data.siteUrl = patch.siteUrl.trim() || null;
  if (patch.builderSlug !== undefined) data.builderSlug = patch.builderSlug.trim() || null;
  if (patch.directOrders !== undefined && Number.isFinite(patch.directOrders)) data.directOrders = Math.max(0, Math.round(patch.directOrders));
  if (patch.guaranteeStart !== undefined) data.guaranteeStart = patch.guaranteeStart ? new Date(patch.guaranteeStart) : null;
  if (patch.bagCardCode !== undefined) data.bagCardCode = patch.bagCardCode.trim().toUpperCase() || null;
  if (patch.notes !== undefined) data.notes = patch.notes;
  if (patch.email !== undefined && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patch.email.trim())) data.email = patch.email.trim().toLowerCase();
  if (patch.restaurantName?.trim()) data.restaurantName = patch.restaurantName.trim();
  if (patch.phone !== undefined) data.phone = patch.phone.trim() || null;
  await db.account.update({ where: { id: accountId }, data });
  done();
  return { ok: true as const };
}

/** Answer / close a change request (the reply shows on their dashboard). */
export async function answerRequest(requestId: string, reply: string, close: boolean) {
  await requireAuth();
  const r = await db.clientRequest.update({
    where: { id: requestId },
    data: { reply: reply.trim() || null, status: close ? "done" : "open", doneAt: close ? new Date() : null },
    include: { account: true },
  });
  if (reply.trim()) {
    await sendMail(r.account.email, `Re: your change request`, `You asked: ${r.message}\n\n${reply.trim()}\n\n${dash()}\n\nBen, Starvega`).catch(() => false);
  }
  done();
  return { ok: true as const };
}

/** Add a client by hand (someone who paid outside the site, e.g. an existing client). */
export async function addClientByHand(input: { email: string; restaurantName: string; ownerName?: string; phone?: string; siteUrl?: string }) {
  await requireAuth();
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !input.restaurantName.trim()) return { ok: false as const, error: "Email and restaurant name are needed." };
  const exists = await db.account.findUnique({ where: { email } });
  if (exists) return { ok: false as const, error: "That email already has an account." };
  await db.account.create({
    data: {
      email,
      restaurantName: input.restaurantName.trim(),
      ownerName: input.ownerName?.trim() || null,
      phone: input.phone?.trim() || null,
      siteUrl: input.siteUrl?.trim() || null,
      siteStatus: input.siteUrl?.trim() ? "live" : "onboarding",
    },
  });
  done();
  return { ok: true as const };
}

/** Pull the latest from PayPal for every open subscription. */
export async function refreshBilling() {
  await requireAuth();
  const subs = await db.subscription.findMany({ where: { status: { notIn: ["cancelled", "expired"] } } });
  await Promise.all(subs.map((s) => syncSubscription(s).catch(() => null)));
  done();
  return { ok: true as const, count: subs.length };
}
