import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  hasError?: boolean;
};

export function Select({
  hasError = false,
  className = "",
  children,
  ...props
}: SelectProps) {
  return (
    <div className="relative">
      <select
        aria-invalid={hasError || undefined}
        className={`
          min-h-11 w-full appearance-none rounded-md border bg-surface
          px-4 pr-11 text-base text-foreground
          shadow-[var(--shadow-xs)]
          transition-colors duration-150
          hover:border-border-strong
          focus:border-brand focus:outline-none
          focus:ring-[3px] focus:ring-brand/20
          disabled:cursor-not-allowed
          disabled:bg-page-muted
          disabled:text-disabled
          ${
            hasError
              ? "border-error focus:border-error focus:ring-error/20"
              : "border-border"
          }
          ${className}
        `}
        {...props}
      >
        {children}
      </select>

      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}