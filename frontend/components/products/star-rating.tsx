"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: number;
}

export function StarRating({ rating, size = 14 }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => {
        const filled = i < fullStars;
        const half = i === fullStars && hasHalfStar;

        return (
          <Star
            key={i}
            size={size}
            className={`${
              filled || half
                ? "fill-amber-400 text-amber-400"
                : "fill-border text-border"
            }`}
          />
        );
      })}
    </div>
  );
}
