import { CircleAlert } from "lucide-react";

type FormErrorProps = {
  id?: string;
  message?: string;
};

export function FormError({ id, message }: FormErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      role="alert"
      className="flex items-start gap-2 text-sm font-medium text-error"
    >
      <CircleAlert
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0"
      />

      <span>{message}</span>
    </p>
  );
}