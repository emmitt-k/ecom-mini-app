"use client";

import { ChevronDown } from "lucide-react";

type SortOption = "featured" | "newest" | "price-low" | "price-high" | "rating";

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const options: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="
          appearance-none
          py-2.5 pl-4 pr-10
          bg-white border border-border rounded-lg
          text-sm text-text-secondary
          focus:outline-none focus:border-primary
          cursor-pointer
          min-w-[160px]
        "
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
      />
    </div>
  );
}
