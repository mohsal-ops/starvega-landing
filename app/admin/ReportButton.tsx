"use client";

import { useState } from "react";

// "Generate report" action: reveals the pre-built markdown report (generated on
// the server for the selected range) in a modal, ready to copy or download and
// paste to an outside analyst. The text is plain markdown - no raw JSON.

export function ReportButton({ markdown, rangeLabel }: { markdown: string; rangeLabel: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked - the user can still select the textarea manually */
    }
  }

  function download() {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `starvega-report-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-ink bg-ink px-3 py-1.5 text-sm text-bg transition-colors hover:bg-ink/90"
      >
        Generate report
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-line bg-bg p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-ink">Visitor report</h2>
                <p className="text-xs text-ink-soft">{rangeLabel} · markdown, ready to paste</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-line px-2.5 py-1 text-sm text-ink-soft hover:text-ink"
                aria-label="Close"
              >
                Close
              </button>
            </div>

            <textarea
              readOnly
              value={markdown}
              onFocus={(e) => e.currentTarget.select()}
              className="mt-4 min-h-[300px] flex-1 resize-none rounded-lg border border-line bg-paper p-3 font-mono text-xs leading-relaxed text-ink"
            />

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={copy}
                className="rounded-lg border border-ink bg-ink px-3 py-1.5 text-sm text-bg hover:bg-ink/90"
              >
                {copied ? "Copied ✓" : "Copy to clipboard"}
              </button>
              <button
                onClick={download}
                className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink-soft hover:text-ink"
              >
                Download .md
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
