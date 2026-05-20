"use client";

import { useEffect, useRef } from "react";
import { Product } from "@/api/products";
import { ProductCard } from "./product-card";
import { Loader2 } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  isLoading: boolean;
}

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-border-light overflow-hidden">
      <div className="aspect-square bg-surface-dim animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 bg-surface-dim rounded animate-pulse" />
        <div className="h-4 w-full bg-surface-dim rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-surface-dim rounded animate-pulse" />
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-surface-dim rounded-full animate-pulse" />
          ))}
        </div>
        <div className="h-5 w-20 bg-surface-dim rounded animate-pulse" />
      </div>
    </div>
  );
}

export function ProductGrid({
  products,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isLoading,
}: ProductGridProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Auto-load on scroll
  useEffect(() => {
    if (loadMoreRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        { rootMargin: "200px" }
      );

      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
        {[...Array(8)].map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-text-tertiary text-lg">No products found</p>
        <p className="text-text-tertiary text-sm mt-1">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Load More Trigger */}
      <div
        ref={loadMoreRef}
        className="flex justify-center py-8"
      >
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-text-tertiary">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading more...</span>
          </div>
        )}
      </div>
    </>
  );
}
