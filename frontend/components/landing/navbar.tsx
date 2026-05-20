"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-[16px] border-b border-[#f1f5f9] transition-shadow duration-300 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-heading text-2xl font-extrabold tracking-tight text-[#0f172a] flex items-center gap-2"
        >
          Shopica
          <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => handleNavClick("#benefits")}
            className="text-sm font-medium text-[#475569] hover:text-primary transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => handleNavClick("#cta")}
            className="text-sm font-medium text-[#475569] hover:text-primary transition-colors"
          >
            Get Started
          </button>
          <Link
            href="/login"
            className="inline-flex items-center text-sm font-semibold text-white bg-primary px-5 py-2 rounded-md hover:bg-primary-dark transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
          >
            Sign In
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-[#0f172a]" />
          ) : (
            <Menu className="w-6 h-6 text-[#0f172a]" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 top-[72px] bg-white z-40 transition-opacity duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          <button
            onClick={() => handleNavClick("#benefits")}
            className="text-lg font-medium text-[#475569] hover:text-primary transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => handleNavClick("#cta")}
            className="text-lg font-medium text-[#475569] hover:text-primary transition-colors"
          >
            Get Started
          </button>
          <Link
            href="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="inline-flex items-center text-base font-semibold text-white bg-primary px-6 py-3 rounded-md hover:bg-primary-dark transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}
