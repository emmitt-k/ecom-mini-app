"use client";

import Link from "next/link";

// Social icons
function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const footerLinks = {
  shop: [
    { label: "New Arrivals", href: "#" },
    { label: "Best Sellers", href: "#" },
    { label: "Collections", href: "#" },
    { label: "Sale", href: "#" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Sustainability", href: "#" },
  ],
  support: [
    { label: "Help Center", href: "#" },
    { label: "Shipping Info", href: "#" },
    { label: "Returns & Exchanges", href: "#" },
    { label: "Contact Us", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#f8fafc] border-t border-[#f1f5f9]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="font-heading text-2xl font-extrabold tracking-tight text-[#0f172a] flex items-center gap-2 mb-4"
            >
              Shopica
              <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
            </Link>
            <p className="text-sm text-[#475569] leading-relaxed mb-6 max-w-xs">
              Discover products you'll love. Shop smarter with curated picks,
              fast delivery, and easy returns.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Twitter"
                className="w-10 h-10 flex items-center justify-center rounded-md bg-white border border-[#e2e8f0] hover:border-primary hover:bg-primary-light transition-all"
                onClick={(e) => e.preventDefault()}
              >
                <TwitterIcon className="w-[18px] h-[18px] fill-[#475569] hover:fill-primary" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-10 h-10 flex items-center justify-center rounded-md bg-white border border-[#e2e8f0] hover:border-primary hover:bg-primary-light transition-all"
                onClick={(e) => e.preventDefault()}
              >
                <InstagramIcon className="w-[18px] h-[18px] fill-[#475569] hover:fill-primary" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-10 h-10 flex items-center justify-center rounded-md bg-white border border-[#e2e8f0] hover:border-primary hover:bg-primary-light transition-all"
                onClick={(e) => e.preventDefault()}
              >
                <LinkedInIcon className="w-[18px] h-[18px] fill-[#475569] hover:fill-primary" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-xs font-bold tracking-wider uppercase text-[#0f172a] mb-5">
              Shop
            </h4>
            <nav className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-[#475569] hover:text-primary transition-colors"
                  onClick={(e) => e.preventDefault()}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-xs font-bold tracking-wider uppercase text-[#0f172a] mb-5">
              Company
            </h4>
            <nav className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-[#475569] hover:text-primary transition-colors"
                  onClick={(e) => e.preventDefault()}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-xs font-bold tracking-wider uppercase text-[#0f172a] mb-5">
              Support
            </h4>
            <nav className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-[#475569] hover:text-primary transition-colors"
                  onClick={(e) => e.preventDefault()}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#e2e8f0] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#94a3b8]">
          <span>&copy; {new Date().getFullYear()} Shopica. All rights reserved.</span>
          <div className="flex gap-6">
            <a
              href="#"
              className="hover:text-primary transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-primary transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="hover:text-primary transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Cookie Settings
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
