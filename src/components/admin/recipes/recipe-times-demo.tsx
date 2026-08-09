"use client";

import { useMemo, useState } from "react";
import {
  ChefHat,
  Clock3,
  Flame,
  Hourglass,
} from "lucide-react";

import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";

type TimeValues = {
  preparation: string;
  cooking: string;
  additional: string;
};

type TimeFieldProps = {
  id: string;
  label: string;
  description: string;
  value: string;
  icon: React.ReactNode;
  required?: boolean;
  error?: string;
  onChange: (value: string) => void;
};

function parseMinutes(value: string) {
  const parsedValue = Number(value);

  if (
    !value ||
    !Number.isFinite(parsedValue) ||
    parsedValue < 0
  ) {
    return 0;
  }

  return parsedValue;
}

function formatDuration(totalMinutes: number) {
  if (totalMinutes <= 0) {
    return "0 min";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} ${hours === 1 ? "h" : "h"}`;
  }

  return `${hours} h ${minutes} min`;
}

function TimeField({
  id,
  label,
  description,
  value,
  icon,
  required = false,
  error,
  onChange,
}: TimeFieldProps) {
  return (
    <div className="rounded-lg border border-border bg-page p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-page-muted text-brand">
          {icon}
        </span>

        <div>
          <label
            htmlFor={id}
            className="text-sm font-semibold text-foreground"
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

                <span className="sr-only">
                  {" "}
                  obligatorio
                </span>
              </>
            )}
          </label>

          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="relative">
          <Input
            id={id}
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={value}
            onChange={(event) =>
              onChange(event.target.value)
            }
            hasError={Boolean(error)}
            aria-describedby={
              error ? `${id}-error` : undefined
            }
            placeholder="0"
            className="pr-24"
          />

          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            minutos
          </span>
        </div>

        <div className="mt-2">
          <FormError
            id={`${id}-error`}
            message={error}
          />
        </div>
      </div>
    </div>
  );
}

export function RecipeTimesDemo() {
  const [times, setTimes] = useState<TimeValues>({
    preparation: "20",
    cooking: "35",
    additional: "0",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof TimeValues, string>>
  >({});

  const preparationMinutes = parseMinutes(
    times.preparation,
  );

  const cookingMinutes = parseMinutes(
    times.cooking,
  );

  const additionalMinutes = parseMinutes(
    times.additional,
  );

  const totalMinutes = useMemo(
    () =>
      preparationMinutes +
      cookingMinutes +
      additionalMinutes,
    [
      preparationMinutes,
      cookingMinutes,
      additionalMinutes,
    ],
  );

  function updateTime(
    field: keyof TimeValues,
    value: string,
  ) {
    setTimes((currentTimes) => ({
      ...currentTimes,
      [field]: value,
    }));

    if (
      value !== "" &&
      Number(value) < 0
    ) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [field]:
          "El tiempo no puede ser negativo.",
      }));

      return;
    }

    if (
      value !== "" &&
      !Number.isInteger(Number(value))
    ) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [field]:
          "Introduce el tiempo en minutos completos.",
      }));

      return;
    }

    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: "",
    }));
  }

  function validatePreparationTime() {
    if (!times.preparation) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        preparation:
          "Indica el tiempo de preparación.",
      }));

      return;
    }

    if (Number(times.preparation) <= 0) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        preparation:
          "El tiempo de preparación debe ser mayor que 0.",
      }));
    }
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
      <div>
        <h3 className="font-serif text-xl font-bold">
          Tiempos de la receta
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Introduce cada duración en minutos. CociHub
          calculará automáticamente el tiempo total y lo
          mostrará después en un formato más fácil de leer.
        </p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <TimeField
          id="recipe-preparation-time"
          label="Preparación"
          description="Tiempo empleado antes del cocinado."
          value={times.preparation}
          required
          error={errors.preparation}
          onChange={(value) =>
            updateTime(
              "preparation",
              value,
            )
          }
          icon={
            <ChefHat
              aria-hidden="true"
              className="size-5"
            />
          }
        />

        <TimeField
          id="recipe-cooking-time"
          label="Cocinado"
          description="Tiempo que requiere la cocción o preparación activa."
          value={times.cooking}
          error={errors.cooking}
          onChange={(value) =>
            updateTime(
              "cooking",
              value,
            )
          }
          icon={
            <Flame
              aria-hidden="true"
              className="size-5"
            />
          }
        />

        <TimeField
          id="recipe-additional-time"
          label="Tiempo adicional"
          description="Reposo, marinado, enfriado u otros tiempos."
          value={times.additional}
          error={errors.additional}
          onChange={(value) =>
            updateTime(
              "additional",
              value,
            )
          }
          icon={
            <Hourglass
              aria-hidden="true"
              className="size-5"
            />
          }
        />
      </div>

      <button
        type="button"
        onClick={validatePreparationTime}
        className="mt-3 text-sm font-semibold text-brand hover:underline"
      >
        Validar tiempo de preparación
      </button>

      <div className="mt-8 overflow-hidden rounded-lg border border-border bg-page">
        <div className="border-b border-border p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-brand text-inverse">
              <Clock3
                aria-hidden="true"
                className="size-5"
              />
            </span>

            <div>
              <p className="text-sm text-muted-foreground">
                Tiempo total estimado
              </p>

              <p
                className="font-serif text-2xl font-bold"
                aria-live="polite"
              >
                {formatDuration(totalMinutes)}
              </p>
            </div>
          </div>
        </div>

        <dl className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="p-4 text-center">
            <dt className="text-sm text-muted-foreground">
              Preparación
            </dt>

            <dd className="mt-1 font-semibold">
              {formatDuration(
                preparationMinutes,
              )}
            </dd>
          </div>

          <div className="p-4 text-center">
            <dt className="text-sm text-muted-foreground">
              Cocinado
            </dt>

            <dd className="mt-1 font-semibold">
              {formatDuration(
                cookingMinutes,
              )}
            </dd>
          </div>

          <div className="p-4 text-center">
            <dt className="text-sm text-muted-foreground">
              Adicional
            </dt>

            <dd className="mt-1 font-semibold">
              {formatDuration(
                additionalMinutes,
              )}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}