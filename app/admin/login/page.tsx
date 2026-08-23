"use client";

import { useActionState } from "react";
import { login } from "../_actions/auth";

export default function AdminLogin() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink p-6 text-bg">
      <form action={action} className="w-full max-w-sm space-y-5 rounded-2xl border border-white/15 bg-white/5 p-7">
        <div>
          <h1 className="text-lg font-semibold">Starvega admin</h1>
          <p className="mt-1 text-sm text-white/60">Enter the admin password.</p>
        </div>
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-bg outline-none focus:border-amber"
        />
        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-amber px-3 py-2.5 text-sm font-semibold text-ink hover:bg-[#f0904a] disabled:opacity-60"
        >
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
