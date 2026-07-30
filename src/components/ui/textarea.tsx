import type { TextareaHTMLAttributes } from "react";

type TextareaProps =
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    hasError?: boolean;
  };

export function Textarea({
  hasError = false,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={`
        min-h-32 w-full resize-y rounded-md border bg-surface
        px-4 py-3 text-base leading-relaxed text-foreground
        shadow-[var(--shadow-xs)]
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