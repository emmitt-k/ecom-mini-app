"use client";

import { cn } from "@/lib/utils";

interface DividerProps {
  children?: React.ReactNode;
  className?: string;
}

export function Divider({ children, className }: DividerProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="flex-1 h-px bg-border" />
      {children && (
        <span className="text-xs text-text-tertiary whitespace-nowrap">
          {children}
        </span>
      )}
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
