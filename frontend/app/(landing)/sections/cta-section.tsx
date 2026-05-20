"use client";

import { ArrowRight, Apple } from "lucide-react";

// Google Play icon component
function PlayStoreIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34 15.19 12l1.62 3.12zm.91-.91L19.59 12l-1.87-2.21-1.62 3.12.62 3.3zM6.05 2.66l10.76 6.22-1.62 3.12L6.05 2.66z" />
    </svg>
  );
}

export function CTASection() {
  return (
    <section id="cta" className="bg-[#0f172a] relative overflow-hidden py-20 lg:py-28">
      {/* Decorative gradient orbs */}
      <div className="absolute -top-1/2 -right-[20%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.3)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-1/2 -left-[20%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.2)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
        {/* Label */}
        <div className="inline-flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase text-white/70 mb-4">
          <ArrowRight className="w-4 h-4" />
          Get Started Today
        </div>

        {/* Title */}
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-tight leading-tight mb-4 text-white">
          Ready to discover
          <br />
          something amazing?
        </h2>

        {/* Description */}
        <p className="text-base text-white/60 leading-relaxed mb-8 max-w-md mx-auto">
          Join thousands of happy shoppers and start exploring curated products
          from the world's best brands.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => {
            const element = document.querySelector("#benefits");
            if (element) element.scrollIntoView({ behavior: "smooth" });
          }}
          className="inline-flex items-center text-sm font-semibold text-[#0f172a] bg-white px-8 py-4 rounded-md hover:bg-white/90 transition-colors"
        >
          Start Shopping — It's Free
        </button>

        {/* Store Buttons (Decorative) */}
        <div className="flex justify-center gap-4 flex-wrap mt-6">
          <button
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/15 rounded-md text-white/70 text-xs font-medium hover:bg-white/15 hover:text-white transition-all"
            onClick={(e) => e.preventDefault()}
          >
            <Apple className="w-4 h-4" />
            App Store
          </button>
          <button
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/15 rounded-md text-white/70 text-xs font-medium hover:bg-white/15 hover:text-white transition-all"
            onClick={(e) => e.preventDefault()}
          >
            <PlayStoreIcon className="w-4 h-4" />
            Google Play
          </button>
        </div>
      </div>
    </section>
  );
}
