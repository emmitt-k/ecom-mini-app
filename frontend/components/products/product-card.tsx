"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/api/products";
import { StarRating } from "./star-rating";

interface ProductCardProps {
  product: Product;
}

// Generate a random rating for demo (in real app, would come from API)
function getProductRating(id: string): { rating: number; reviews: number } {
  // Deterministic pseudo-random based on ID
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rating = 3.5 + (hash % 20) / 10; // 3.5 - 5.5, clamped to 5
  const reviews = 20 + (hash % 200);
  return { rating: Math.min(rating, 5), reviews };
}

// Generate badge based on product properties
type BadgeType = "new" | "sale" | "hot";

function getBadge(product: Product): { type: BadgeType; label: string } | null {
  const hash = product.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  if (product.price > 300 && hash % 3 === 0) {
    return { type: "sale", label: "Sale" };
  }
  if (hash % 5 === 0) {
    return { type: "new", label: "New" };
  }
  if (product.stockQuantity < 20 && hash % 2 === 0) {
    return { type: "hot", label: "Hot" };
  }
  return null;
}

// Generate original price (sale items)
function getOriginalPrice(product: Product): number | null {
  const badge = getBadge(product);
  if (badge?.type === "sale") {
    return Math.round(product.price * 1.3);
  }
  return null;
}

export function ProductCard({ product }: ProductCardProps) {
  const { rating, reviews } = getProductRating(product.id);
  const badge = getBadge(product);
  const originalPrice = getOriginalPrice(product);

  const badgeStyles = {
    new: "bg-primary text-white",
    sale: "bg-destructive text-white",
    hot: "bg-amber-500 text-slate-900",
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group bg-white rounded-xl border border-border-light overflow-hidden transition-all duration-300 hover:border-primary-light hover:shadow-lg hover:-translate-y-1 cursor-pointer">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-surface-dim">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-tertiary">
              No Image
            </div>
          )}

          {/* Badge */}
          {badge && (
            <div
              className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded ${badgeStyles[badge.type]}`}
            >
              {badge.label}
            </div>
          )}

          {/* Quick View Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              className="w-full py-2 px-4 text-sm font-semibold bg-white text-text-primary rounded hover:bg-primary hover:text-white transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Quick View
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Brand */}
          <div className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-1">
            Shopica
          </div>

          {/* Name */}
          <h3 className="font-jakarta font-semibold text-[15px] text-text-primary mb-2 line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2">
            <StarRating rating={rating} size={13} />
            <span className="text-xs text-text-tertiary">({reviews})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="font-jakarta font-bold text-lg text-text-primary">
              ${product.price}
            </span>
            {originalPrice && (
              <span className="text-sm text-text-tertiary line-through">
                ${originalPrice}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
