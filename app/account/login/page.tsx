import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentAccountId } from "@/lib/account-auth";
import { LoginClient } from "./LoginClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign in | Starvega", robots: { index: false, follow: false } };

export default async function AccountLogin() {
  if (await currentAccountId()) redirect("/account");
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-4 pt-20">
      <div className="w-full max-w-md rounded-3xl border border-line bg-bg p-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)]">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-deep">Your Starvega account</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Sign in</h1>
        <p className="mt-2 text-ink-soft">No password. We email you a 6-digit code.</p>
        <LoginClient />
      </div>
    </main>
  );
}
