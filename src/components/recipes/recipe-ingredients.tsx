"use client";

import {
  Minus,
  Plus,
  RotateCcw,
  Users,
} from "lucide-react";

import {
  useState,
} from "react";

import type {
  PublicRecipeIngredientGroup,
} from "@/types/public-recipe";


type RecipeIngredientsProps = {
  baseServings:
    number | null;

  ingredientGroups:
    PublicRecipeIngredientGroup[];
};


const MIN_SERVINGS =
  1;

const MAX_SERVINGS =
  20;


function clampServings(
  servings:
    number,
) {
  return Math.min(
    MAX_SERVINGS,
    Math.max(
      MIN_SERVINGS,
      servings,
    ),
  );
}


function formatQuantity(
  quantity:
    number | null,

  scalable:
    boolean,

  factor:
    number,
) {
  if (
    quantity ===
    null
  ) {
    return null;
  }


  const calculatedQuantity =
    scalable
      ? quantity *
        factor
      : quantity;


  const roundedQuantity =
    Math.round(
      calculatedQuantity *
        100,
    ) /
    100;


  return new Intl.NumberFormat(
    "es-ES",
    {
      maximumFractionDigits:
        2,
    },
  ).format(
    roundedQuantity,
  );
}


export function RecipeIngredients({
  baseServings,
  ingredientGroups,
}: RecipeIngredientsProps) {
  const validBaseServings =
    baseServings &&
    baseServings >
      0
      ? baseServings
      : null;


  const initialServings =
    validBaseServings
      ? clampServings(
          validBaseServings,
        )
      : 1;


  const [
    selectedServings,
    setSelectedServings,
  ] =
    useState(
      initialServings,
    );


  const factor =
    validBaseServings
      ? selectedServings /
        validBaseServings
      : 1;


  const canScale =
    validBaseServings !==
    null;


  function decreaseServings() {
    setSelectedServings(
      (
        current,
      ) =>
        clampServings(
          current -
            1,
        ),
    );
  }


  function increaseServings() {
    setSelectedServings(
      (
        current,
      ) =>
        clampServings(
          current +
            1,
        ),
    );
  }


  function resetServings() {
    if (
      !validBaseServings
    ) {
      return;
    }


    setSelectedServings(
      clampServings(
        validBaseServings,
      ),
    );
  }


  if (
    ingredientGroups.length ===
    0
  ) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-border bg-page-muted/50 px-5 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          No hay ingredientes
          disponibles.
        </p>
      </div>
    );
  }


  return (
    <div className="mt-7">
      {canScale ? (
        <div className="mb-8 overflow-hidden rounded-2xl border border-secondary/25 bg-secondary/10">
          <div className="p-5 md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-md">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-secondary/20 text-secondary-hover">
                    <Users
                      className="size-5"
                      aria-hidden="true"
                    />
                  </span>

                  <div>
                    <p className="font-semibold text-foreground">
                      Ajustar raciones
                    </p>

                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Recalculamos las
                      cantidades
                      escalables por ti.
                    </p>
                  </div>
                </div>
              </div>


              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="inline-flex w-fit items-center overflow-hidden rounded-xl border border-border bg-surface shadow-xs">
                  <button
                    type="button"
                    onClick={
                      decreaseServings
                    }
                    disabled={
                      selectedServings <=
                      MIN_SERVINGS
                    }
                    aria-label="Reducir una ración"
                    className="flex size-11 items-center justify-center text-foreground transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <Minus
                      className="size-4"
                      aria-hidden="true"
                    />
                  </button>


                  <div
                    className="min-w-24 border-x border-border px-4 text-center"
                    aria-live="polite"
                  >
                    <span className="text-lg font-bold text-foreground">
                      {
                        selectedServings
                      }
                    </span>

                    <span className="ml-1 text-xs text-muted-foreground">
                      {selectedServings ===
                      1
                        ? "ración"
                        : "raciones"}
                    </span>
                  </div>


                  <button
                    type="button"
                    onClick={
                      increaseServings
                    }
                    disabled={
                      selectedServings >=
                      MAX_SERVINGS
                    }
                    aria-label="Añadir una ración"
                    className="flex size-11 items-center justify-center text-foreground transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <Plus
                      className="size-4"
                      aria-hidden="true"
                    />
                  </button>
                </div>


                {selectedServings !==
                validBaseServings ? (
                  <button
                    type="button"
                    onClick={
                      resetServings
                    }
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-muted-foreground transition hover:bg-page-muted hover:text-foreground"
                  >
                    <RotateCcw
                      className="size-4"
                      aria-hidden="true"
                    />

                    Restablecer
                  </button>
                ) : null}
              </div>
            </div>
          </div>


          <div className="border-t border-secondary/20 bg-surface/50 px-5 py-3 text-xs text-muted-foreground md:px-6">
            Receta original
            calculada para{" "}
            <strong className="font-semibold text-foreground">
              {
                validBaseServings
              }{" "}
              {validBaseServings ===
              1
                ? "ración"
                : "raciones"}
            </strong>
            .
          </div>
        </div>
      ) : null}


      <div className="space-y-8">
        {ingredientGroups.map(
          (
            group,
          ) => (
            <section
              key={
                group.id
              }
            >
              {group.name ? (
                <h3 className="font-serif text-xl font-bold text-foreground">
                  {
                    group.name
                  }
                </h3>
              ) : null}


              <ul className="mt-3 overflow-hidden rounded-2xl border border-border bg-page/40">
                {group.ingredients.map(
                  (
                    ingredient,
                  ) => {
                    const quantity =
                      formatQuantity(
                        ingredient.quantity,
                        ingredient.scalable,
                        factor,
                      );


                    return (
                      <li
                        key={
                          ingredient.id
                        }
                        className="grid grid-cols-[minmax(78px,auto)_minmax(0,1fr)] gap-4 border-b border-border px-4 py-4 last:border-b-0 sm:px-5"
                      >
                        <div>
                          {quantity ? (
                            <span className="inline-flex min-w-16 justify-center rounded-lg bg-brand/10 px-2.5 py-1.5 text-sm font-bold text-brand">
                              {
                                quantity
                              }

                              {ingredient.unit
                                ? ` ${ingredient.unit}`
                                : ""}
                            </span>
                          ) : (
                            <span className="inline-flex min-w-16 justify-center rounded-lg bg-page-muted px-2.5 py-1.5 text-sm font-medium text-muted-foreground">
                              —
                            </span>
                          )}
                        </div>


                        <div className="min-w-0 pt-1">
                          <span className="font-medium text-foreground">
                            {
                              ingredient.name
                            }
                          </span>


                          {ingredient.notes ? (
                            <p className="mt-1 text-sm leading-5 text-muted-foreground">
                              {
                                ingredient.notes
                              }
                            </p>
                          ) : null}
                        </div>
                      </li>
                    );
                  },
                )}
              </ul>
            </section>
          ),
        )}
      </div>
    </div>
  );
}