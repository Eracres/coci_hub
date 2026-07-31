"use client";

import { useState } from "react";
import { RotateCcw, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";

export function RecipeServingsDemo() {
  const [baseServings, setBaseServings] = useState("4");
  const [selectedServings, setSelectedServings] = useState(4);
  const [error, setError] = useState("");

  const parsedBaseServings = Number(baseServings);
  const hasValidBaseServings =
    Number.isInteger(parsedBaseServings) &&
    parsedBaseServings >= 1 &&
    parsedBaseServings <= 100;

  const scaleFactor = hasValidBaseServings
    ? selectedServings / parsedBaseServings
    : 1;

  function updateBaseServings(value: string) {
    setBaseServings(value);

    const parsedValue = Number(value);

    if (
      !Number.isInteger(parsedValue) ||
      parsedValue < 1 ||
      parsedValue > 100
    ) {
      setError(
        "Introduce un número entero de entre 1 y 100 personas.",
      );
      return;
    }

    setError("");
    setSelectedServings(parsedValue);
  }

  function decreaseServings() {
    setSelectedServings((current) =>
      Math.max(1, current - 1),
    );
  }

  function increaseServings() {
    setSelectedServings((current) =>
      Math.min(20, current + 1),
    );
  }

  function resetServings() {
    if (hasValidBaseServings) {
      setSelectedServings(parsedBaseServings);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-page-muted text-brand">
            <Users aria-hidden="true" className="size-5" />
          </span>

          <div>
            <h3 className="font-serif text-xl font-bold">
              Raciones base
            </h3>

            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Indica para cuántas personas están calculadas las
              cantidades que introduces en la receta.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <label
            htmlFor="base-servings"
            className="mb-2 block text-sm font-semibold"
          >
            Número de personas
            <span aria-hidden="true" className="ml-1 text-error">
              *
            </span>
            <span className="sr-only"> obligatorio</span>
          </label>

          <div className="relative max-w-xs">
            <Input
              id="base-servings"
              type="number"
              inputMode="numeric"
              min="1"
              max="100"
              step="1"
              value={baseServings}
              onChange={(event) =>
                updateBaseServings(event.target.value)
              }
              hasError={Boolean(error)}
              aria-describedby={
                error
                  ? "base-servings-error"
                  : "base-servings-description"
              }
              className="pr-24"
            />

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              personas
            </span>
          </div>

          <p
            id="base-servings-description"
            className="mt-2 text-sm text-muted-foreground"
          >
            Este dato será obligatorio antes de publicar.
          </p>

          <div className="mt-2">
            <FormError
              id="base-servings-error"
              message={error}
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
        <h3 className="font-serif text-xl font-bold">
          Vista pública del selector
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          El visitante podrá adaptar las cantidades al número de
          personas para las que vaya a cocinar.
        </p>

        <div className="mt-6 rounded-lg border border-border bg-page p-5">
          <p className="text-sm font-semibold">
            Comensales
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={decreaseServings}
              disabled={selectedServings <= 1}
              aria-label="Reducir el número de comensales"
              className="inline-flex size-11 items-center justify-center rounded-md border border-border bg-surface text-xl font-semibold transition-colors hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              −
            </button>

            <output
              aria-live="polite"
              className="min-w-32 text-center font-serif text-xl font-bold"
            >
              {selectedServings}{" "}
              {selectedServings === 1
                ? "persona"
                : "personas"}
            </output>

            <button
              type="button"
              onClick={increaseServings}
              disabled={selectedServings >= 20}
              aria-label="Aumentar el número de comensales"
              className="inline-flex size-11 items-center justify-center rounded-md border border-border bg-surface text-xl font-semibold transition-colors hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              Factor aplicado:{" "}
              <strong className="text-foreground">
                × {scaleFactor.toLocaleString("es-ES", {
                  maximumFractionDigits: 2,
                })}
              </strong>
            </p>

            <Button
              type="button"
              size="sm"
              variant="tertiary"
              onClick={resetServings}
              disabled={!hasValidBaseServings}
            >
              <RotateCcw
                aria-hidden="true"
                className="size-4"
              />
              Restablecer
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}