"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Globe, MessageCircle, Shield } from "lucide-react";

const benefits = [
  {
    icon: Shield,
    iconBg: "bg-primary-light",
    iconColor: "text-primary",
    title: "Verified Quality",
    description:
      "Every product vetted by our team. No counterfeits, no surprises — just authentic goods from brands you trust.",
    delay: 0,
  },
  {
    icon: Globe,
    iconBg: "bg-success-light",
    iconColor: "text-success",
    title: "Free Global Shipping",
    description:
      "Delivered to your door at no extra cost. Track your order in real time and get updates at every step.",
    delay: 100,
  },
  {
    icon: MessageCircle,
    iconBg: "bg-purple-100",
    iconColor: "text-accent",
    title: "Always Here For You",
    description:
      "24/7 support from real humans. Chat, email, or call — we're here to help with anything, anytime.",
    delay: 200,
  },
];

function BenefitCard({
  benefit,
  isVisible,
}: {
  benefit: (typeof benefits)[0];
  isVisible: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-xl p-8 border border-[#f1f5f9] transition-all duration-300 hover:border-primary-light hover:shadow-lg hover:-translate-y-1 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${benefit.delay}ms` }}
    >
      <div
        className={`w-13 h-13 rounded-md ${benefit.iconBg} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}
      >
        <benefit.icon className={`w-6 h-6 ${benefit.iconColor}`} />
      </div>
      <h3 className="font-heading text-lg font-bold text-[#0f172a] mb-2">
        {benefit.title}
      </h3>
      <p className="text-sm text-[#475569] leading-relaxed mb-4">
        {benefit.description}
      </p>
      <a
        href="#"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2 transition-all"
        onClick={(e) => e.preventDefault()}
      >
        Learn more
        <ArrowRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

export function BenefitsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="benefits"
      ref={sectionRef}
      className="py-20 lg:py-28 bg-[#f8fafc]"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div
          className={`text-center max-w-xl mx-auto mb-10 transition-all duration-600 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-primary mb-3">
            <Shield className="w-4 h-4" />
            Why Shopica
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-tight leading-tight mb-3 text-[#0f172a]">
            Shopping made effortless
          </h2>
          <p className="text-base text-[#475569] leading-relaxed">
            From discovery to doorstep, we've rebuilt every step of the
            experience around what matters most — you.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {benefits.map((benefit) => (
            <BenefitCard
              key={benefit.title}
              benefit={benefit}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
