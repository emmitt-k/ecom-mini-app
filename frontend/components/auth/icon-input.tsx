"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface IconInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
  error?: boolean;
}

export const IconInput = forwardRef<HTMLInputElement, IconInputProps>(
  ({ className, icon: Icon, error, ...props }, ref) => {
    return (
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-tertiary pointer-events-none" />
        <input
          ref={ref}
          className={cn(
            "w-full h-10 pl-11 pr-3 py-2",
            "text-sm text-text-primary placeholder:text-text-tertiary",
            "bg-surface border border-border rounded-md",
            "transition-all duration-200",
            "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/10",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error &&
              "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
IconInput.displayName = "IconInput";
