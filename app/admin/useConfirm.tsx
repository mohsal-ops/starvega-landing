"use client";

// Self-contained promise-based confirmation dialog (replaces window.confirm()).
// No provider or extra deps needed - a component calls the hook and renders the
// returned element:
//
//   const [confirm, confirmDialog] = useConfirm();
//   ...
//   if (!(await confirm({ title: "Delete this lead?", destructive: true }))) return;
//   ...
//   return (<> ...{confirmDialog} </>);

import { useCallback, useEffect, useRef, useState } from "react";

export type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
};

export function useConfirm() {
  const [state, setState] = useState<{ open: boolean; opts: ConfirmOptions }>({
    open: false,
    opts: {},
  });
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions = {}) => {
    setState({ open: true, opts });
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = useCallback((v: boolean) => {
    setState((s) => ({ ...s, open: false }));
    resolver.current?.(v);
    resolver.current = null;
  }, []);

  useEffect(() => {
    if (!state.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") settle(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.open, settle]);

  const { opts } = state;
  const dialog = state.open ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={() => settle(false)} />
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative z-[101] w-full max-w-md rounded-xl border border-stone-200 bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-stone-900">{opts.title ?? "Are you sure?"}</h2>
        {opts.description ? (
          <p className="mt-2 text-sm text-stone-500">{opts.description}</p>
        ) : null}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => settle(false)}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-stone-200 bg-white px-4 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-300"
          >
            {opts.cancelText ?? "Cancel"}
          </button>
          <button
            type="button"
            autoFocus
            onClick={() => settle(true)}
            className={
              "inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 " +
              (opts.destructive
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-400"
                : "bg-stone-900 hover:bg-stone-800 focus:ring-stone-500")
            }
          >
            {opts.confirmText ?? "Confirm"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return [confirm, dialog] as const;
}
