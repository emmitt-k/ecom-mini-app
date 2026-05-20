"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShopNavbarProps {
  onSearchClick?: () => void;
}

export function ShopNavbar({ onSearchClick }: ShopNavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

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
            <DropdownMenu>
              <DropdownMenuTrigger className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center text-sm font-bold text-primary border-2 border-white hover:bg-primary hover:text-white transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 mt-1">
                <div className="px-3 py-2 text-sm font-medium text-text-primary">
                  {user?.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive-light"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
