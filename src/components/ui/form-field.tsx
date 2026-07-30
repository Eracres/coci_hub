import type { ReactNode } from "react";
import { FormError } from "@/components/ui/form-error";

type FormFieldProps = {
  children: ReactNode;
  label: string;
  htmlFor: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
};

export function FormField({
  children,
  label,
  htmlFor,
  description,
  error,
  required = false,
  className = "",
}: FormFieldProps) {
  const descriptionId = description
    ? `${htmlFor}-description`
    : undefined;

  const errorId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className={`space-y-2 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-semibold text-foreground"
      >
        {label}

        {required && (
          <>
            <span
              aria-hidden="true"
              className="ml-1 text-error"
            >
              *
            </span>

            <span className="sr-only"> obligatorio</span>
          </>
        )}
      </label>

      {children}

      {description && !error && (
        <p
          id={descriptionId}
          className="text-sm leading-relaxed text-muted-foreground"
        >
          {description}
        </p>
      )}

      <FormError id={errorId} message={error} />
    </div>
  );
}