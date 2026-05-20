"use client";

import { Truck, Shield, CheckCircle, Heart, Box, Users } from "lucide-react";

const marqueeItems = [
  { icon: Truck, text: "Free Shipping Worldwide" },
  { icon: Shield, text: "Buyer Protection" },
  { icon: CheckCircle, text: "Easy 30-Day Returns" },
  { icon: Heart, text: "Secure Payments" },
  { icon: Box, text: "Curated Collections" },
  { icon: Users, text: "50,000+ Happy Customers" },
];

export function MarqueeSection() {
  // Duplicate items for seamless loop
  const allItems = [...marqueeItems, ...marqueeItems];

  return (
    <div className="bg-[#0f172a] py-3.5 overflow-hidden relative">
      {/* Gradient masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0f172a] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0f172a] to-transparent z-10 pointer-events-none" />

      {/* Marquee track */}
      <div className="flex animate-marquee whitespace-nowrap">
        {allItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 text-sm font-medium text-white/60 px-10"
          >
            <item.icon className="w-4 h-4 text-primary-light flex-shrink-0" />
            {item.text}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
          width: max-content;
        }
      `}</style>
    </div>
  );
}
