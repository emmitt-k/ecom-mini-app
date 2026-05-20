"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle, Star, Zap } from "lucide-react";

export function HeroSection() {

  return (
    <section className="min-h-screen flex items-center bg-gradient-to-br from-[#eff6ff] via-white via-40% via-white via-60% to-[#faf5ff] relative overflow-hidden pt-[72px]">
      {/* Decorative gradient orbs */}
      <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-[150px] -left-[150px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
        {/* Content */}
        <div className="max-w-xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary-light px-4 py-2 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" />
            Now in 50+ countries
          </div>

          {/* Title */}
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-[clamp(2.75rem,5vw,4rem)] font-extrabold tracking-tight leading-[1.1] mb-5 text-[#0f172a]">
            Shop smarter.
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Live better.
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg text-[#475569] leading-relaxed mb-8 max-w-md">
            Discover curated products from trusted brands. Fast delivery, easy
            returns, and prices that make you smile.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 items-center mb-6">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-dark transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
            >
              Start Shopping
              <ArrowRight className="w-[18px] h-[18px]" />
            </Link>
            <button
              onClick={() => {
                const element = document.querySelector("#cta");
                if (element) element.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-[#0f172a] bg-white border border-[#e2e8f0] rounded-md hover:border-[#94a3b8] hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              Learn More
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Trust badge */}
          <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>Trusted by 50,000+ happy customers</span>
          </div>
        </div>

        {/* Visual */}
        <div className="relative flex justify-center">
          {/* Image Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-[480px]">
            <div className="rounded-xl overflow-hidden shadow-lg hover:-translate-y-1 transition-transform duration-300">
              <Image
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80"
                alt="Shopping experience"
                width={400}
                height={200}
                className="w-full h-[200px] object-cover"
              />
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg hover:-translate-y-1 transition-transform duration-300 mt-8">
              <Image
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"
                alt="Premium product"
                width={400}
                height={200}
                className="w-full h-[200px] object-cover"
              />
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg hover:-translate-y-1 transition-transform duration-300 -mt-4">
              <Image
                src="https://images.unsplash.com/photo-1556742049-0cfed93da23b?w=400&q=80"
                alt="Fast delivery"
                width={400}
                height={200}
                className="w-full h-[200px] object-cover"
              />
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg hover:-translate-y-1 transition-transform duration-300">
              <Image
                src="https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80"
                alt="Satisfaction guaranteed"
                width={400}
                height={200}
                className="w-full h-[200px] object-cover"
              />
            </div>
          </div>

          {/* Floating Cards */}
          <div className="absolute bottom-8 -left-8 bg-white rounded-lg p-3 shadow-xl flex items-center gap-3 animate-float hidden lg:flex">
            <div className="w-9 h-9 rounded-md bg-success-light flex items-center justify-center flex-shrink-0">
              <Star className="w-[18px] h-[18px] text-success" />
            </div>
            <div>
              <div className="text-xs text-[#94a3b8]">Customer rating</div>
              <div className="text-sm font-bold text-[#0f172a]">4.9 / 5.0</div>
            </div>
          </div>

          <div className="absolute top-8 -right-6 bg-white rounded-lg p-3 shadow-xl flex items-center gap-3 animate-float hidden lg:flex" style={{ animationDelay: "0.5s" }}>
            <div className="w-9 h-9 rounded-md bg-primary-light flex items-center justify-center flex-shrink-0">
              <ArrowRight className="w-[18px] h-[18px] text-primary" />
            </div>
            <div>
              <div className="text-xs text-[#94a3b8]">Delivery</div>
              <div className="text-sm font-bold text-[#0f172a]">Free & Fast</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
