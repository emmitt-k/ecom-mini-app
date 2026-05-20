"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProduct } from "@/api/products";
import { ShopNavbar } from "@/components/products/shop-navbar";
import { StarRating } from "@/components/products/star-rating";
import {
  ChevronLeft,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  Shield,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";

function getProductRating(id: string): { rating: number; reviews: number } {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rating = 3.5 + (hash % 20) / 10;
  const reviews = 20 + (hash % 200);
  return { rating: Math.min(rating, 5), reviews };
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: product, isLoading, isError } = useProduct(id);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Generate rating
  const { rating, reviews } = getProductRating(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <ShopNavbar />
        <div className="max-w-[1400px] mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="aspect-square bg-surface-dim rounded-2xl animate-pulse" />
            <div className="space-y-6">
              <div className="h-8 w-3/4 bg-surface-dim rounded animate-pulse" />
              <div className="h-6 w-32 bg-surface-dim rounded animate-pulse" />
              <div className="h-4 w-full bg-surface-dim rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-surface-dim rounded animate-pulse" />
              <div className="h-12 w-48 bg-surface-dim rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-white">
        <ShopNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <p className="text-destructive font-medium">Product not found</p>
            <Link
              href="/products"
              className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ShopNavbar />

      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors mb-6"
        >
          <ChevronLeft size={16} />
          Back to Products
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-surface-dim rounded-2xl overflow-hidden">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                  No Image
                </div>
              )}
            </div>
            {/* Thumbnail gallery - mock */}
            <div className="flex gap-3">
              {[0, 1, 2, 3].map((i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === i
                      ? "border-primary"
                      : "border-transparent hover:border-border"
                  }`}
                >
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={`${product.name} view ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-dim" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand */}
            <div className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Shopica
            </div>

            {/* Title */}
            <h1 className="font-jakarta text-3xl lg:text-4xl font-bold text-text-primary leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <StarRating rating={rating} size={18} />
              <span className="text-sm text-text-secondary">
                {rating.toFixed(1)} ({reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-jakarta text-3xl font-bold text-text-primary">
                ${product.price}
              </span>
              {product.price > 200 && (
                <span className="text-lg text-text-tertiary line-through">
                  ${Math.round(product.price * 1.25)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-text-secondary leading-relaxed">
              {product.description ||
                "Experience premium quality with this beautifully crafted piece. Designed for comfort and style, it features high-quality materials and attention to detail that sets it apart."}
            </p>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  product.stockQuantity > 10
                    ? "bg-success"
                    : product.stockQuantity > 0
                      ? "bg-amber-500"
                      : "bg-destructive"
                }`}
              />
              <span className="text-sm text-text-secondary">
                {product.stockQuantity > 10
                  ? "In Stock"
                  : product.stockQuantity > 0
                    ? `Only ${product.stockQuantity} left`
                    : "Out of Stock"}
              </span>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              {/* Quantity Selector */}
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-surface-alt transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stockQuantity, quantity + 1))
                  }
                  className="p-3 hover:bg-surface-alt transition-colors"
                  disabled={quantity >= product.stockQuantity}
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                disabled={product.stockQuantity === 0}
              >
                <ShoppingBag size={20} />
                Add to Cart
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border-light">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-xs font-medium text-text-secondary">
                  Free Shipping
                </p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-xs font-medium text-text-secondary">
                  Secure Payment
                </p>
              </div>
              <div className="text-center">
                <RefreshCw className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-xs font-medium text-text-secondary">
                  Easy Returns
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
