"use client";

import Link from "next/link";
import { Search, ShoppingBag, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface ShopNavbarProps {
  onSearchClick?: () => void;
}

export function ShopNavbar({ onSearchClick }: ShopNavbarProps) {
  const { user, isAuthenticated } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-[16px] border-b border-border-light">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Logo + Breadcrumb */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-jakarta text-xl font-extrabold tracking-tight text-text-primary flex items-center gap-1.5"
          >
            Shopica
            <span className="w-2 h-2 rounded-full bg-primary" />
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-text-tertiary">
            <Link href="/" className="text-text-secondary hover:text-primary transition-colors">
              Home
            </Link>
            <span className="text-border">/</span>
            <span className="text-text-primary font-semibold">All Products</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={onSearchClick}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-border bg-white hover:border-primary-light hover:bg-primary-50 transition-all"
            aria-label="Search"
          >
            <Search size={20} className="text-text-secondary" />
          </button>

          <button
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-border bg-white hover:border-primary-light hover:bg-primary-50 transition-all relative"
            aria-label="Cart"
          >
            <ShoppingBag size={20} className="text-text-secondary" />
            {/* Cart badge - hidden for now */}
            {/* <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary border-2 border-white" /> */}
          </button>

          {isAuthenticated ? (
            <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center text-sm font-bold text-primary border-2 border-white cursor-pointer">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
          ) : (
            <Link
              href="/login"
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-border bg-white hover:border-primary-light hover:bg-primary-50 transition-all"
              aria-label="Account"
            >
              <User size={20} className="text-text-secondary" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
