type RadioOption = {
  value: string;
  label: string;
  description?: string;
};

type RadioGroupProps = {
  name: string;
  legend: string;
  options: RadioOption[];
  defaultValue?: string;
  required?: boolean;
};

export function RadioGroup({
  name,
  legend,
  options,
  defaultValue,
  required = false,
}: RadioGroupProps) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-foreground">
        {legend}

        {required && (
          <>
            <span aria-hidden="true" className="ml-1 text-error">
              *
            </span>
            <span className="sr-only"> obligatorio</span>
          </>
        )}
      </legend>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {options.map((option) => {
          const id = `${name}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={id}
              className="
                flex min-h-11 cursor-pointer items-start gap-3
                rounded-md border border-border bg-surface p-3
                transition-colors
                hover:border-border-strong hover:bg-page-muted
                has-[:checked]:border-brand
                has-[:checked]:bg-surface-hover
              "
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                defaultChecked={defaultValue === option.value}
                className="
                  mt-0.5 size-5 shrink-0 accent-[var(--color-brand-primary)]
                  focus-visible:outline-none
                  focus-visible:ring-[3px]
                  focus-visible:ring-brand/20
                "
              />

              <span>
                <span className="block text-sm font-semibold">
                  {option.label}
                </span>

                {option.description && (
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {option.description}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}