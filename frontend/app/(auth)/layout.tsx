import { ReactNode } from "react";
import Image from "next/image";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Gradient with Image */}
      <div className="hidden lg:flex flex-1 relative flex-col justify-center items-center p-12 overflow-hidden bg-gradient-to-br from-accent via-[#5b21b6] to-primary">
        {/* Decorative gradient orbs */}
        <div className="absolute -top-[30%] -right-[20%] w-[80%] h-[80%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 text-center max-w-md">
          {/* Logo */}
          <div className="font-heading text-3xl font-extrabold tracking-tight text-white mb-16 flex items-center justify-center gap-2">
            Shopica
            <span className="w-3 h-3 rounded-full bg-white/30 inline-block" />
          </div>

          {/* Simple image instead of feature cards */}
          <div className="relative w-full max-w-[320px] mx-auto mb-10">
            <div className="aspect-[4/3] relative rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=450&fit=crop"
                alt="Shopping illustration"
                fill
                className="object-cover opacity-90"
                priority
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-accent/40 to-transparent" />
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8 justify-center">
            <div className="text-center">
              <div className="font-heading text-[1.75rem] font-extrabold text-white">
                50K+
              </div>
              <div className="text-sm text-white/60 mt-1">Customers</div>
            </div>
            <div className="text-center">
              <div className="font-heading text-[1.75rem] font-extrabold text-white">
                4.9
              </div>
              <div className="text-sm text-white/60 mt-1">Rating</div>
            </div>
            <div className="text-center">
              <div className="font-heading text-[1.75rem] font-extrabold text-white">
                50+
              </div>
              <div className="text-sm text-white/60 mt-1">Countries</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-[520px] flex-shrink-0 flex flex-col justify-center px-6 py-12 sm:px-12 lg:p-12 min-h-screen overflow-y-auto bg-surface">
        <div className="w-full max-w-[400px] mx-auto">{children}</div>
      </div>
    </div>
  );
}
