"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useProducts, Product } from "@/api/products";
import { ShopNavbar } from "@/components/products/shop-navbar";
import { FiltersSidebar } from "@/components/products/filters-sidebar";
import { ProductGrid } from "@/components/products/product-grid";
import { SortSelect } from "@/components/products/sort-select";

type SortOption = "featured" | "newest" | "price-low" | "price-high" | "rating";
type ItemsPerPageOption = 5 | 10 | 20 | 30 | 50;

function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];
  switch (sort) {
    case "price-low":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-high":
      return sorted.sort((a, b) => b.price - a.price);
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case "rating":
      // Pseudo-rating sort based on ID for demo
      return sorted.sort(
        (a, b) =>
          b.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) -
          a.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
      );
    default:
      return sorted;
  }
}

function filterByRating(products: Product[], minRating: number | null): Product[] {
  if (!minRating) return products;
  // Filter based on pseudo-rating
  return products.filter(
    (p) =>
      (p.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 50) / 10 +
        3 >=
      minRating
  );
}

export default function ProductsPage() {
  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [appliedMinPrice, setAppliedMinPrice] = useState(0);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(1000);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Items per page state with localStorage persistence
  const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPageOption>(20);
  const [isItemsPerPageOpen, setIsItemsPerPageOpen] = useState(false);
  const itemsPerPageRef = useRef<HTMLDivElement>(null);

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("productBatchSize");
    if (saved) {
      const parsed = parseInt(saved, 10);
      if ([5, 10, 20, 30, 50].includes(parsed)) {
        setItemsPerPage(parsed as ItemsPerPageOption);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (itemsPerPageRef.current && !itemsPerPageRef.current.contains(event.target as Node)) {
        setIsItemsPerPageOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch products with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useProducts({
    search: searchQuery || undefined,
    minPrice: appliedMinPrice > 0 ? appliedMinPrice : undefined,
    maxPrice: appliedMaxPrice < 1000 ? appliedMaxPrice : undefined,
    limit: itemsPerPage,
  });

  // Flatten all pages
  const allProducts = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  // Apply client-side filters (category, rating, sort)
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Category filter (mock - would be API filter in real app)
    if (selectedCategory !== "all") {
      // Mock category filtering based on product name/price patterns
      const hash = selectedCategory.length;
      result = result.filter(
        (_, i) => (i + hash) % 3 === 0 || (i + hash) % 5 === 0
      );
    }

    // Rating filter
    result = filterByRating(result, selectedRating);

    // Sort
    result = sortProducts(result, sortBy);

    return result;
  }, [allProducts, selectedCategory, selectedRating, sortBy]);

  // Total count from API
  const totalCount = useMemo(() => {
    return data?.pages[0]?.meta?.hasMore
      ? `${filteredProducts.length}+`
      : filteredProducts.length.toString();
  }, [data, filteredProducts.length]);

  // Handle search focus from navbar
  const handleSearchClick = () => {
    setIsSearchFocused(true);
    searchInputRef.current?.focus();
  };

  // Clear all filters
  const handleClearAll = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setMinPrice(0);
    setMaxPrice(1000);
    setAppliedMinPrice(0);
    setAppliedMaxPrice(1000);
    setSelectedRating(null);
    setSortBy("featured");
  };

  // Apply price filter
  const handleApplyPrice = () => {
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
  };

  // Check if any filters active
  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "all" ||
    appliedMinPrice > 0 ||
    appliedMaxPrice < 1000 ||
    selectedRating !== null;

  if (isError) {
    return (
      <div className="min-h-screen bg-surface-alt">
        <ShopNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <p className="text-destructive font-medium">Failed to load products</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-alt">
      {/* Navbar */}
      <ShopNavbar onSearchClick={handleSearchClick} />

      {/* Layout */}
      <div className="max-w-[1400px] mx-auto flex">
        {/* Sidebar */}
        <FiltersSidebar
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onApplyPrice={handleApplyPrice}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedRating={selectedRating}
          onRatingChange={setSelectedRating}
          onClearAll={handleClearAll}
          isMobileOpen={isMobileFiltersOpen}
          onMobileClose={() => setIsMobileFiltersOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-jakarta text-2xl font-extrabold text-text-primary tracking-tight">
                All Products
              </h1>
              <p className="text-sm text-text-tertiary mt-0.5">
                Showing {filteredProducts.length} of {totalCount} products
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 sm:flex-initial">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`
                    w-full sm:w-[240px] pl-10 pr-4 py-2.5
                    bg-white border border-border rounded-lg
                    text-sm text-text-primary placeholder:text-text-tertiary
                    focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10
                    transition-all
                    ${isSearchFocused ? "ring-3 ring-primary/10" : ""}
                  `}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Sort */}
              <SortSelect value={sortBy} onChange={setSortBy} />

              {/* Items Per Page */}
              <div ref={itemsPerPageRef} className="relative">
                <button
                  onClick={() => setIsItemsPerPageOpen(!isItemsPerPageOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-lg text-sm font-medium text-text-secondary hover:border-primary-light hover:text-primary transition-all"
                >
                  <span>{itemsPerPage} / page</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${isItemsPerPageOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isItemsPerPageOpen && (
                  <div className="absolute right-0 top-full mt-1 w-28 bg-white border border-border rounded-lg shadow-lg z-50 py-1">
                    {[5, 10, 20, 30, 50].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setItemsPerPage(option as ItemsPerPageOption);
                          localStorage.setItem("productBatchSize", option.toString());
                          setIsItemsPerPageOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                          itemsPerPage === option
                            ? "bg-primary-50 text-primary font-medium"
                            : "text-text-secondary hover:bg-surface-alt"
                        }`}
                      >
                        {option} items
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-lg text-sm font-medium text-text-secondary hover:border-primary-light hover:text-primary transition-all"
              >
                <SlidersHorizontal size={18} />
                Filters
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-primary-50 text-primary">
                  &quot;{searchQuery}&quot;
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:bg-primary-light rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {selectedCategory !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-primary-50 text-primary">
                  {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="hover:bg-primary-light rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {(appliedMinPrice > 0 || appliedMaxPrice < 1000) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-primary-50 text-primary">
                  ${appliedMinPrice} – ${appliedMaxPrice}
                  <button
                    onClick={() => {
                      setMinPrice(0);
                      setMaxPrice(1000);
                      setAppliedMinPrice(0);
                      setAppliedMaxPrice(1000);
                    }}
                    className="hover:bg-primary-light rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {selectedRating && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-primary-50 text-primary">
                  {selectedRating}+ stars
                  <button
                    onClick={() => setSelectedRating(null)}
                    className="hover:bg-primary-light rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Product Grid */}
          <ProductGrid
            products={filteredProducts}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            isLoading={isLoading}
          />
        </main>
      </div>

      {/* Mobile Filter Button (Floating) */}
      <button
        onClick={() => setIsMobileFiltersOpen(true)}
        className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-lg hover:bg-primary-dark transition-all"
      >
        <SlidersHorizontal size={18} />
        Filters
      </button>
    </div>
  );
}
