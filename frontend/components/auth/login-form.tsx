"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { IconInput } from "./icon-input";
import { PasswordInput } from "./password-input";
import { SocialButton } from "./social-button";
import { Divider } from "./divider";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().min(1, "Please enter your email").email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter your password"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      await login(data.email, data.password);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px]">
      <div className="mb-7">
        <h1 className="font-heading text-[1.75rem] font-extrabold tracking-tight text-text-primary mb-2">
          Welcome back
        </h1>
        <p className="text-[0.95rem] text-text-secondary leading-relaxed">
          Sign in to continue shopping and track your orders
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-5 rounded-md bg-destructive-light text-destructive text-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <div className="flex gap-3 mb-7">
        <SocialButton provider="google">Sign in with Google</SocialButton>
        <SocialButton provider="apple">Sign in with Apple</SocialButton>
      </div>

      <Divider className="mb-7">or sign in with email</Divider>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">
            Email
          </label>
          <IconInput
            icon={Mail}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1.5">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold text-text-primary">
              Password
            </label>
            <Link
              href="#"
              className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            placeholder="Enter your password"
            autoComplete="current-password"
            error={!!errors.password}
            showStrength={false}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive mt-1.5">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full py-3.5 px-4 mt-2",
            "flex items-center justify-center gap-2",
            "text-sm font-semibold text-white",
            "bg-primary rounded-md",
            "transition-all duration-200",
            "hover:bg-primary-dark hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)]",
            "active:scale-[0.98]",
            "disabled:opacity-70 disabled:pointer-events-none"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-[18px] h-[18px] animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <p className="text-center mt-7 text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
