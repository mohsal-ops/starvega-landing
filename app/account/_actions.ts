"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { clearAccountCookie, requireAccount } from "@/lib/account-auth";
import { cancelSubscription, LIVE_STATUSES } from "@/lib/billing";
import { sendOwnerMail } from "@/lib/mail";
import { SITE } from "@/lib/site";

const admin = () => `${SITE.url.replace(/\/$/, "")}/admin/clients`;

export async function signOut() {
  await clearAccountCookie();
  redirect("/account/login");
}

/** "Ask for a change" from the dashboard. Emails Ben. */
export async function sendRequest(message: string) {
  const account = await requireAccount();
  const m = message.trim().slice(0, 2000);
  if (m.length < 3) return { ok: false as const, error: "Tell me what you'd like changed." };
  const open = await db.clientRequest.count({ where: { accountId: account.id, status: "open" } });
  if (open >= 20) return { ok: false as const, error: "You have 20 open requests. I'll get through them first." };
  await db.clientRequest.create({ data: { accountId: account.id, message: m } });
  await sendOwnerMail(`Change request: ${account.restaurantName}`, `${account.restaurantName} asked:\n\n${m}\n\n${admin()}`).catch(() => false);
  revalidatePath("/account");
  return { ok: true as const };
}

/** Stop the plan. PayPal stops charging; the site stays up until the paid month ends. */
export async function cancelPlan(subscriptionId: string, reason: string) {
  const account = await requireAccount();
  const sub = await db.subscription.findFirst({ where: { id: subscriptionId, accountId: account.id } });
  if (!sub || !LIVE_STATUSES.concat("suspended").includes(sub.status)) return { ok: false as const, error: "This plan isn't active." };
  try {
    await cancelSubscription(sub.providerSubId, reason || "Cancelled from the dashboard");
  } catch (e) {
    console.error("[account/cancel]", e);
    return { ok: false as const, error: "PayPal didn't accept the cancel right now. Try again, or message me and I'll do it." };
  }
  await db.subscription.update({ where: { id: sub.id }, data: { status: "cancelled", cancelledAt: new Date(), cancelReason: reason.slice(0, 500) || null } });
  await sendOwnerMail(`Cancelled: ${account.restaurantName}`, `${account.restaurantName} cancelled their plan.\nReason: ${reason || "-"}\n${admin()}`).catch(() => false);
  revalidatePath("/account");
  return { ok: true as const };
}
