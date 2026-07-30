import type { InputHTMLAttributes } from "react";
import { Check } from "lucide-react";

type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: string;
  description?: string;
};

export function Checkbox({
  label,
  description,
  className = "",
  id,
  ...props
}: CheckboxProps) {
  const inputId = id ?? props.name;

  return (
    <label
      htmlFor={inputId}
      className={`
        flex min-h-11 cursor-pointer items-start gap-3
        rounded-md p-2
        transition-colors hover:bg-page-muted
        ${props.disabled ? "cursor-not-allowed opacity-60" : ""}
        ${className}
      `}
    >
      <span className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center">
        <input
          id={inputId}
          type="checkbox"
          className="
            peer size-5 appearance-none rounded-sm border border-border-strong
            bg-surface transition-colors
            checked:border-brand checked:bg-brand
            focus-visible:outline-none
            focus-visible:ring-[3px] focus-visible:ring-brand/20
          "
          {...props}
        />

        <Check
          aria-hidden="true"
          className="
            pointer-events-none absolute size-4
            text-inverse opacity-0
            peer-checked:opacity-100
          "
          strokeWidth={3}
        />
      </span>

      <span>
        <span className="block text-sm font-medium text-foreground">
          {label}
        </span>

        {description && (
          <span className="mt-1 block text-sm text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}