import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export function Input({
  hasError = false,
  className = "",
  ...props
}: InputProps) {
  return (
    <input
      className={`
        min-h-11 w-full rounded-md border bg-surface px-4
        text-base text-foreground shadow-[var(--shadow-xs)]
        transition-colors duration-150
        placeholder:text-disabled
        hover:border-border-strong
        focus:border-brand focus:outline-none
        focus:ring-3 focus:ring-brand/20
        disabled:cursor-not-allowed
        disabled:bg-page-muted
        disabled:text-disabled
        ${hasError ? "border-error focus:border-error focus:ring-error/20" : "border-border"}
        ${className}
      `}
      aria-invalid={hasError || undefined}
      {...props}
    />
  );
}