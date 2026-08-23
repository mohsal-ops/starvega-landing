"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { makeToken, SESSION_COOKIE, MAX_AGE_SEC } from "@/lib/auth";

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
  redirect("/admin");
}

export async function logout(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
