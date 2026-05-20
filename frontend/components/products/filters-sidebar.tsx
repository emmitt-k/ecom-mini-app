"use client";

import { X, SlidersHorizontal } from "lucide-react";
import { StarRating } from "./star-rating";

interface FiltersSidebarProps {
  minPrice: number;
  maxPrice: number;
  onMinPriceChange: (value: number) => void;
  onMaxPriceChange: (value: number) => void;
  onApplyPrice: () => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedRating: number | null;
  onRatingChange: (rating: number | null) => void;
  onClearAll: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const categories = [
  { id: "all", label: "All Products", count: 100 },
  { id: "outerwear", label: "Outerwear", count: 24 },
  { id: "tops", label: "Tops & Shirts", count: 38 },
  { id: "bottoms", label: "Bottoms", count: 22 },
  { id: "dresses", label: "Dresses", count: 18 },
  { id: "knitwear", label: "Knitwear", count: 14 },
  { id: "accessories", label: "Accessories", count: 12 },
];

export function FiltersSidebar({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onApplyPrice,
  selectedCategory,
  onCategoryChange,
  selectedRating,
  onRatingChange,
  onClearAll,
  isMobileOpen,
  onMobileClose,
}: FiltersSidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky lg:top-[64px] left-0 top-0 bottom-0
          w-[85vw] max-w-[320px] lg:w-[280px] lg:max-w-none
          bg-white border-r border-border-light
          p-6 lg:p-6
          overflow-y-auto
          z-50 lg:z-auto
          transition-transform duration-300
          h-screen lg:h-[calc(100vh-64px)]
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between lg:hidden mb-6">
          <h2 className="font-jakarta font-bold text-lg">Filters</h2>
          <button
            onClick={onMobileClose}
            className="p-2 hover:bg-surface-dim rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Categories */}
        <div className="mb-7">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-4">
            Categories
          </h3>
          <ul className="space-y-1">
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => onCategoryChange(cat.id)}
                  className={`
                    w-full flex items-center justify-between
                    px-3 py-2.5 rounded-lg text-sm
                    transition-all duration-200
                    ${
                      selectedCategory === cat.id
                        ? "bg-primary-50 text-primary font-semibold"
                        : "text-text-secondary hover:bg-primary-50 hover:text-primary"
                    }
                  `}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`
                      text-xs px-2 py-0.5 rounded-full
                      ${
                        selectedCategory === cat.id
                          ? "bg-primary-light text-primary"
                          : "bg-surface-dim text-text-tertiary"
                      }
                    `}
                  >
                    {cat.count}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Price Range */}
        <div className="mb-7">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-4">
            Price Range
          </h3>
          <div className="space-y-4">
            {/* Range Slider */}
            <input
              type="range"
              min="0"
              max="1000"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(Number(e.target.value))}
              className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
            />

            {/* Price Inputs */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-1 bg-surface-alt border border-border rounded-lg px-3 py-2 focus-within:border-primary transition-colors">
                <span className="text-sm text-text-tertiary font-medium">$</span>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => onMinPriceChange(Number(e.target.value))}
                  className="w-full bg-transparent border-none outline-none text-sm text-text-primary p-0"
                  placeholder="Min"
                  min={0}
                />
              </div>
              <span className="text-text-tertiary text-sm">—</span>
              <div className="flex-1 flex items-center gap-1 bg-surface-alt border border-border rounded-lg px-3 py-2 focus-within:border-primary transition-colors">
                <span className="text-sm text-text-tertiary font-medium">$</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => onMaxPriceChange(Number(e.target.value))}
                  className="w-full bg-transparent border-none outline-none text-sm text-text-primary p-0"
                  placeholder="Max"
                  min={0}
                />
              </div>
            </div>

            <button
              onClick={onApplyPrice}
              className="w-full py-2 px-4 text-sm font-semibold bg-surface-alt border border-border rounded-lg text-text-secondary hover:bg-primary-50 hover:border-primary-light hover:text-primary transition-all"
            >
              Apply Price Filter
            </button>
          </div>
        </div>

        {/* Rating */}
        <div className="mb-7">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-4">
            Rating
          </h3>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => onRatingChange(null)}
                className={`
                  w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm
                  transition-all duration-200
                  ${
                    selectedRating === null
                      ? "bg-primary-50 text-primary font-semibold"
                      : "text-text-secondary hover:bg-primary-50 hover:text-primary"
                  }
                `}
              >
                All ratings
              </button>
            </li>
            <li>
              <button
                onClick={() => onRatingChange(4)}
                className={`
                  w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm
                  transition-all duration-200
                  ${
                    selectedRating === 4
                      ? "bg-primary-50 text-primary font-semibold"
                      : "text-text-secondary hover:bg-primary-50 hover:text-primary"
                  }
                `}
              >
                <StarRating rating={4} size={14} />
                <span>4 & up</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onRatingChange(3)}
                className={`
                  w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm
                  transition-all duration-200
                  ${
                    selectedRating === 3
                      ? "bg-primary-50 text-primary font-semibold"
                      : "text-text-secondary hover:bg-primary-50 hover:text-primary"
                  }
                `}
              >
                <StarRating rating={3} size={14} />
                <span>3 & up</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Clear All */}
        <button
          onClick={onClearAll}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline transition-all"
        >
          <X size={14} />
          Clear all filters
        </button>
      </aside>
    </>
  );
}
