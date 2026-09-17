import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary:
        "bg-accent-emerald text-white hover:bg-emerald-800 shadow-xs border border-transparent disabled:bg-stone-200 disabled:text-stone-400",
      secondary:
        "bg-surface-subtle text-ink hover:bg-workspace border border-border disabled:opacity-50",
      outline:
        "bg-surface text-ink hover:bg-surface-subtle border border-border disabled:opacity-50",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 shadow-xs border border-transparent disabled:opacity-50",
      ghost:
        "bg-transparent text-ink-muted hover:text-ink hover:bg-surface-subtle border-transparent disabled:opacity-50",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-xl",
      md: "h-10 px-4 text-xs rounded-xl",
      lg: "h-11 px-5 text-sm rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all cursor-pointer select-none focus:outline-hidden focus:ring-2 focus:ring-accent-emerald focus:ring-offset-1 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
