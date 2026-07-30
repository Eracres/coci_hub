import type { InputHTMLAttributes } from "react";

type SwitchProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: string;
  description?: string;
};

export function Switch({
  label,
  description,
  id,
  className = "",
  ...props
}: SwitchProps) {
  const inputId = id ?? props.name;

  return (
    <label
      htmlFor={inputId}
      className={`
        flex cursor-pointer items-center justify-between gap-4
        rounded-lg border border-border bg-surface p-4
        ${props.disabled ? "cursor-not-allowed opacity-60" : ""}
        ${className}
      `}
    >
      <span>
        <span className="block text-sm font-semibold text-foreground">
          {label}
        </span>

        {description && (
          <span className="mt-1 block text-sm text-muted-foreground">
            {description}
          </span>
        )}
      </span>

      <span className="relative shrink-0">
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          className="peer sr-only"
          {...props}
        />

        <span
          className="
            block h-7 w-12 rounded-full bg-border-strong
            transition-colors duration-200
            peer-checked:bg-brand
            peer-focus-visible:ring-[3px]
            peer-focus-visible:ring-brand/20
          "
        />

        <span
          className="
            pointer-events-none absolute left-1 top-1
            size-5 rounded-full bg-white shadow-sm
            transition-transform duration-200
            peer-checked:translate-x-5
          "
        />
      </span>
    </label>
  );
}