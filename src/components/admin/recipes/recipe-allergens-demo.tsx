"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Info,
  ShieldAlert,
} from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";

type Allergen = {
  id: string;
  name: string;
};

const allergens: Allergen[] = [
  { id: "gluten", name: "Gluten" },
  { id: "crustaceans", name: "Crustáceos" },
  { id: "eggs", name: "Huevos" },
  { id: "fish", name: "Pescado" },
  { id: "peanuts", name: "Cacahuetes" },
  { id: "soy", name: "Soja" },
  { id: "milk", name: "Leche" },
  { id: "nuts", name: "Frutos de cáscara" },
  { id: "celery", name: "Apio" },
  { id: "mustard", name: "Mostaza" },
  { id: "sesame", name: "Sésamo" },
  { id: "sulphites", name: "Sulfitos" },
  { id: "lupin", name: "Altramuces" },
  { id: "molluscs", name: "Moluscos" },
];

export function RecipeAllergensDemo() {
  const [presentAllergens, setPresentAllergens] =
    useState<string[]>(["sesame"]);

  const [possibleAllergens, setPossibleAllergens] =
    useState<string[]>([]);

  function togglePresent(allergenId: string) {
    setPresentAllergens((current) => {
      const exists =
        current.includes(allergenId);

      const updated = exists
        ? current.filter(
            (id) => id !== allergenId,
          )
        : [...current, allergenId];

      if (!exists) {
        setPossibleAllergens(
          (currentPossible) =>
            currentPossible.filter(
              (id) => id !== allergenId,
            ),
        );
      }

      return updated;
    });
  }

  function togglePossible(allergenId: string) {
    if (
      presentAllergens.includes(allergenId)
    ) {
      return;
    }

    setPossibleAllergens((current) =>
      current.includes(allergenId)
        ? current.filter(
            (id) => id !== allergenId,
          )
        : [...current, allergenId],
    );
  }

  function getAllergenName(
    allergenId: string,
  ) {
    return (
      allergens.find(
        (allergen) =>
          allergen.id === allergenId,
      )?.name ?? allergenId
    );
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
      <div>
        <h3 className="font-serif text-xl font-bold">
          Información sobre alérgenos
        </h3>

        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Selecciona los alérgenos que forman parte
          de la receta y, cuando corresponda, aquellos
          que podrían estar presentes dependiendo de
          los productos utilizados.
        </p>
      </div>

      {/* Aviso */}

      <div className="mt-6 flex gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4">
        <AlertTriangle
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-warning"
        />

        <div>
          <p className="text-sm font-semibold text-foreground">
            Información orientativa
          </p>

          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            La presencia real de alérgenos puede
            variar según las marcas utilizadas,
            posibles trazas y contaminación cruzada.
            La información deberá comprobarse siempre
            en el etiquetado de cada producto.
          </p>
        </div>
      </div>

      {/* Presentes */}

      <div className="mt-8">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-error/10 text-error">
            <ShieldAlert
              aria-hidden="true"
              className="size-5"
            />
          </span>

          <div>
            <h4 className="font-serif text-lg font-bold">
              Alérgenos presentes
            </h4>

            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Ingredientes que forman parte
              directamente de la receta.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {allergens.map(
            (allergen) => (
              <Checkbox
                key={allergen.id}
                id={`allergen-present-${allergen.id}`}
                name={`allergen-present-${allergen.id}`}
                label={allergen.name}
                checked={presentAllergens.includes(
                  allergen.id,
                )}
                onChange={() =>
                  togglePresent(
                    allergen.id,
                  )
                }
              />
            ),
          )}
        </div>
      </div>

      {/* Posibles */}

      <div className="mt-8 border-t border-border pt-8">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning">
            <Info
              aria-hidden="true"
              className="size-5"
            />
          </span>

          <div>
            <h4 className="font-serif text-lg font-bold">
              Posibles alérgenos o trazas
            </h4>

            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Utiliza esta sección cuando la
              presencia dependa de una marca,
              elaboración industrial o posible
              contaminación cruzada.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {allergens.map(
            (allergen) => {
              const alreadyPresent =
                presentAllergens.includes(
                  allergen.id,
                );

              return (
                <Checkbox
                  key={allergen.id}
                  id={`allergen-possible-${allergen.id}`}
                  name={`allergen-possible-${allergen.id}`}
                  label={allergen.name}
                  checked={possibleAllergens.includes(
                    allergen.id,
                  )}
                  disabled={alreadyPresent}
                  description={
                    alreadyPresent
                      ? "Ya está marcado como presente."
                      : undefined
                  }
                  onChange={() =>
                    togglePossible(
                      allergen.id,
                    )
                  }
                />
              );
            },
          )}
        </div>
      </div>

      {/* Resumen */}

      <div className="mt-8 rounded-lg border border-border bg-page p-5">
        <h4 className="font-serif text-lg font-bold">
          Resumen
        </h4>

        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold">
              Presentes
            </p>

            {presentAllergens.length ===
            0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No se ha indicado ningún
                alérgeno presente.
              </p>
            ) : (
              <ul className="mt-2 flex flex-wrap gap-2">
                {presentAllergens.map(
                  (allergenId) => (
                    <li
                      key={allergenId}
                      className="rounded-full bg-error/10 px-3 py-1.5 text-sm font-semibold text-error"
                    >
                      {getAllergenName(
                        allergenId,
                      )}
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold">
              Posibles / trazas
            </p>

            {possibleAllergens.length ===
            0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No se han indicado posibles
                alérgenos adicionales.
              </p>
            ) : (
              <ul className="mt-2 flex flex-wrap gap-2">
                {possibleAllergens.map(
                  (allergenId) => (
                    <li
                      key={allergenId}
                      className="rounded-full bg-warning/10 px-3 py-1.5 text-sm font-semibold text-warning"
                    >
                      {getAllergenName(
                        allergenId,
                      )}
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}