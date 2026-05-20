"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { IconInput } from "./icon-input";
import { PasswordInput } from "./password-input";
import { SocialButton } from "./social-button";
import { Divider } from "./divider";
import { cn } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().min(1, "Please enter your name"),
  email: z.string().min(1, "Please enter your email").email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      // Note: Backend only accepts email and password, name is for UX only
      await registerUser(data.email, data.password);
      router.push("/products");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px]">
      <div className="mb-7">
        <h1 className="font-heading text-[1.75rem] font-extrabold tracking-tight text-text-primary mb-2">
          Create your account
        </h1>
        <p className="text-[0.95rem] text-text-secondary leading-relaxed">
          Join Shopica and start discovering curated products you&apos;ll love
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
        <SocialButton provider="google">Sign up with Google</SocialButton>
        <SocialButton provider="apple">Sign up with Apple</SocialButton>
      </div>

      <Divider className="mb-7">or register with email</Divider>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">
            Full Name
          </label>
          <IconInput
            icon={User}
            placeholder="John Doe"
            autoComplete="name"
            error={!!errors.name}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1.5">{errors.name.message}</p>
          )}
        </div>

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
          <label className="block text-sm font-semibold text-text-primary mb-1.5">
            Password
          </label>
          <PasswordInput
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={!!errors.password}
            value={password}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive mt-1.5">{errors.password.message}</p>
          )}
        </div>

        <p className="text-sm text-text-secondary leading-relaxed">
          By creating an account, you agree to our{" "}
          <Link href="#" className="font-medium text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="font-medium text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full py-3.5 px-4",
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
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <p className="text-center mt-7 text-sm text-text-secondary">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
