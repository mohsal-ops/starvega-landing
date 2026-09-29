"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { makeToken, SESSION_COOKIE, MAX_AGE_SEC } from "@/lib/auth";
import { OWNER_FLAG } from "@/lib/owner";

export async function login(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const password = String(formData.get("password") || "");
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
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
