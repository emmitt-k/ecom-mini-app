"use client";

import { useState, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Lock, Eye, EyeOff } from "lucide-react";

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: boolean;
  showStrength?: boolean;
  value?: string;
}

function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, showStrength = true, value = "", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const strength = getPasswordStrength(value as string);
    const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
    const strengthColors = [
      "",
      "bg-destructive",
      "bg-amber-500",
      "bg-emerald-500",
      "bg-success",
    ];
    const strengthTextColors = [
      "",
      "text-destructive",
      "text-amber-500",
      "text-emerald-500",
      "text-success",
    ];

    return (
      <div className="space-y-2">
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-tertiary pointer-events-none" />
          <input
            ref={ref}
            type={showPassword ? "text" : "password"}
            value={value}
            className={cn(
              "w-full h-10 pl-11 pr-10 py-2",
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
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-tertiary hover:text-text-primary transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-[18px] h-[18px]" />
            ) : (
              <Eye className="w-[18px] h-[18px]" />
            )}
          </button>
        </div>

        {showStrength && value && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "flex-1 h-[3px] rounded-full transition-colors duration-300",
                    level <= strength ? strengthColors[strength] : "bg-border"
                  )}
                />
              ))}
            </div>
            <p
              className={cn(
                "text-xs",
                strengthTextColors[strength] || "text-text-tertiary"
              )}
            >
              {strengthLabels[strength]}
            </p>
          </div>
        )}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
