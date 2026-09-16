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


const MIN_SERVINGS = 1;
const MAX_SERVINGS = 20;


function clampServings(
  servings: number,
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
      <p className="mt-5 text-muted-foreground">
        No hay ingredientes
        disponibles.
      </p>
    );
  }


  return (
    <div className="mt-6">
      {canScale ? (
        <div className="mb-8 rounded-2xl border border-border bg-secondary/40 p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Users
                  className="h-5 w-5 text-brand"
                  aria-hidden="true"
                />

                Ajustar raciones
              </div>


              <p className="mt-1 text-sm text-muted-foreground">
                Las cantidades
                escalables se
                recalculan
                automáticamente.
              </p>
            </div>


            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center overflow-hidden rounded-xl border border-border bg-white">
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
                  className="flex h-11 w-11 items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </button>


                <div
                  className="min-w-20 border-x border-border px-4 text-center"
                  aria-live="polite"
                >
                  <span className="text-lg font-bold text-foreground">
                    {
                      selectedServings
                    }
                  </span>

                  <span className="ml-1 text-sm text-muted-foreground">
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
                  className="flex h-11 w-11 items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus
                    className="h-4 w-4"
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
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <RotateCcw
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  Restablecer
                </button>
              ) : null}
            </div>
          </div>


          <p className="mt-4 text-xs text-muted-foreground">
            Receta original para{" "}
            {
              validBaseServings
            }{" "}
            {validBaseServings ===
            1
              ? "ración"
              : "raciones"}.
          </p>
        </div>
      ) : null}


      <div className="space-y-8">
        {ingredientGroups.map(
          (
            group,
          ) => (
            <div
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


              <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-white px-5">
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
                        className="flex gap-3 py-4"
                      >
                        <div className="min-w-[90px] font-semibold text-foreground">
                          {quantity ? (
                            <>
                              {
                                quantity
                              }

                              {ingredient.unit
                                ? ` ${ingredient.unit}`
                                : ""}
                            </>
                          ) : (
                            <span className="text-muted-foreground">
                              —
                            </span>
                          )}
                        </div>


                        <div>
                          <span className="text-foreground">
                            {
                              ingredient.name
                            }
                          </span>


                          {ingredient.notes ? (
                            <span className="ml-2 text-sm text-muted-foreground">
                              —{" "}
                              {
                                ingredient.notes
                              }
                            </span>
                          ) : null}
                        </div>
                      </li>
                    );
                  },
                )}
              </ul>
            </div>
          ),
        )}
      </div>
    </div>
  );
}