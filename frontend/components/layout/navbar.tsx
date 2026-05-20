"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-xl font-bold">
            E-Commerce
          </Link>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <span className="text-sm text-gray-500">Loading...</span>
            ) : isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:inline">
                  {user?.email}
                </span>
                <Button variant="outline" size="sm" onClick={() => logout()}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
