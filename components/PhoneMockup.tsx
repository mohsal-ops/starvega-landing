// A phone frame showing a realistic incoming birthday-offer text — the concrete
// "here's what this looks like" visual for the loyalty section. Real phone
// proportions (~9:19.5), dynamic island, status bar, message thread pinned to
// the bottom, and an iMessage input bar so it reads as a real screen. Monochrome
// to match the system (ink bezel, white screen, neutral bubbles); the soft
// shadow is allowed because this depicts a product, like SiteMockup.
export function PhoneMockup({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-[290px] max-w-full rounded-[3rem] border border-ink/10 bg-ink p-3 shadow-2xl shadow-ink/25 ${className}`}
    >
      <div className="relative flex aspect-[9/19.5] flex-col overflow-hidden rounded-[2.3rem] bg-white">
        {/* dynamic island */}
        <div className="absolute left-1/2 top-2.5 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-ink" />

        {/* status bar */}
        <div className="flex items-center justify-between px-7 pb-1 pt-4 text-[12px] font-semibold text-ink">
          <span>9:41</span>
          <span className="flex items-center gap-1.5 text-ink">
            <svg width="17" height="11" viewBox="0 0 17 11" fill="none" aria-hidden>
              <rect x="0" y="6" width="3" height="5" rx="1" fill="currentColor" />
              <rect x="4.5" y="4" width="3" height="7" rx="1" fill="currentColor" />
              <rect x="9" y="2" width="3" height="9" rx="1" fill="currentColor" />
              <rect x="13.5" y="0" width="3" height="11" rx="1" fill="currentColor" opacity="0.35" />
            </svg>
            <svg width="17" height="11" viewBox="0 0 18 12" fill="none" aria-hidden>
              <rect x="0.5" y="1" width="14" height="9.5" rx="2.5" stroke="currentColor" />
              <rect x="2" y="2.5" width="10.5" height="6.5" rx="1.2" fill="currentColor" />
              <rect x="15.5" y="4" width="1.6" height="3.5" rx="0.8" fill="currentColor" />
            </svg>
          </span>
        </div>

        {/* contact header */}
        <div className="flex flex-col items-center gap-1 border-b border-line px-4 pb-3 pt-2">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-ink text-base font-semibold text-white">
            B
          </span>
          <span className="text-[13px] font-semibold text-ink">Bella Kitchen</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-ink-soft">
            Text Message
          </span>
        </div>

        {/* thread — pinned to the bottom like a real conversation */}
        <div className="flex flex-1 flex-col justify-end gap-2.5 px-3.5 pb-3">
          <p className="text-center text-[10px] font-medium text-ink-soft">Last month</p>
          <div className="flex justify-start">
            <div className="max-w-[82%] rounded-2xl rounded-bl-md bg-[#eaeaea] px-3.5 py-2 text-[12.5px] leading-snug text-ink">
              You&apos;re on the list 🎉 We&apos;ll text you the occasional treat — nothing spammy.
            </div>
          </div>

          <p className="mt-1 text-center text-[10px] font-medium text-ink-soft">Today 9:02 AM</p>
          <div className="flex justify-start">
            <div className="max-w-[86%] rounded-2xl rounded-bl-md bg-[#eaeaea] px-3.5 py-2.5 text-[13px] leading-snug text-ink">
              Happy early birthday from Bella Kitchen! 🎂 Here&apos;s{" "}
              <span className="font-semibold">15% off</span> this week — come celebrate with us.
            </div>
          </div>
          <p className="pl-1 text-[9px] font-medium text-ink-soft">Delivered</p>
        </div>

        {/* imessage input bar */}
        <div className="flex items-center gap-2 border-t border-line px-3 py-2.5">
          <div className="flex flex-1 items-center rounded-full border border-line px-3 py-1.5 text-[12px] text-ink-soft">
            iMessage
          </div>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-white">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 20V5M12 5l-6 6M12 5l6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}
