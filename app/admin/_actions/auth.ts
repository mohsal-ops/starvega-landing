"use server";

import { createHash, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { makeToken, SESSION_COOKIE, MAX_AGE_SEC } from "@/lib/auth";
import { OWNER_FLAG } from "@/lib/owner";
import { clientIp, rateLimit } from "@/lib/rateLimit";

// Constant-time compare (hash both so lengths match and nothing leaks by timing).
function samePassword(a: string, b: string) {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}

export async function login(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  // 5 tries per 15 minutes per IP - stops password guessing.
  const ip = clientIp(await headers());
  if (!(await rateLimit(`admin-login:${ip}`, 5, 15 * 60))) {
    return { error: "Too many attempts. Wait 15 minutes and try again." };
  }
  const password = String(formData.get("password") || "");
  const real = process.env.ADMIN_PASSWORD || "";
  if (!real || !samePassword(password, real)) {
    return { error: "Wrong password." };
  }
  (await cookies()).set(SESSION_COOKIE, makeToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
  // Logging in marks this browser as the owner so its visits stay out of analytics.
  (await cookies()).set(OWNER_FLAG, "true", { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 730 });
  redirect("/admin");
}

export async function logout(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
