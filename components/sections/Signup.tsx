import Faq from "@/components/sections/Faq";
import { MockupForm } from "@/components/MockupForm";
import { PreviewLink } from "@/components/PreviewWindow";

// SECTION 5 - FAQ + SIGNUP. The last doubts answered, then the same 3-field
// mockup form as the hero for anyone who read to the end.
export default function Signup() {
  return (
    <section id="signup" className="border-t border-line">
      <Faq />
      <div className="bg-ink px-4 py-20 text-bg sm:px-10 sm:py-28">
        <div className="mx-auto w-full max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-amber">Free, no obligation</p>
          <h2 className="text-[clamp(2rem,6vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
            See your restaurant&apos;s site before you spend a dollar.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/70">
            Tell me who you are and I&apos;ll design a mockup with your name and menu, then message you within 24 hours.
          </p>
          <div className="mt-8">
            <MockupForm placement="final_cta" onInk />
          </div>
          <PreviewLink onInk className="mt-5" />
        </div>
      </div>
    </section>
  );
}
