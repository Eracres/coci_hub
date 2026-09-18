"use client";

import {
  Bot,
  CircleAlert,
  Plus,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import type {
  AiRecipeAllergen,
  AiRecipeImport,
  AiRecipeIngredient,
  AiRecipeIngredientGroup,
  AiRecipeStep,
} from "@/schemas/ai-recipe-import-schema";


type AiRecipeImportReviewProps = {
  recipe:
    AiRecipeImport;

  onChange:
    (
      recipe:
        AiRecipeImport,
    ) => void;
};


function parseNullableInteger(
  value:
    string,
) {
  if (
    value.trim() ===
    ""
  ) {
    return null;
  }


  const parsed =
    Number.parseInt(
      value,
      10,
    );


  return Number.isFinite(
    parsed,
  )
    ? parsed
    : null;
}


function parseNullableNumber(
  value:
    string,
) {
  if (
    value.trim() ===
    ""
  ) {
    return null;
  }


  const parsed =
    Number(
      value,
    );


  return Number.isFinite(
    parsed,
  )
    ? parsed
    : null;
}


function stringToNullable(
  value:
    string,
) {
  const normalized =
    value.trim();


  return normalized
    ? normalized
    : null;
}


function arrayToText(
  values:
    string[],
) {
  return values.join(
    ", ",
  );
}


function textToArray(
  value:
    string,
) {
  return value
    .split(
      ",",
    )
    .map(
      (
        item,
      ) =>
        item.trim(),
    )
    .filter(
      Boolean,
    );
}


function getConfidenceLabel(
  confidence:
    AiRecipeImport["confidence"],
) {
  switch (
    confidence
  ) {
    case "high":
      return "Alta";

    case "medium":
      return "Media";

    case "low":
      return "Baja";
  }
}


export function AiRecipeImportReview({
  recipe,
  onChange,
}: AiRecipeImportReviewProps) {
  function updateRecipe(
    changes:
      Partial<AiRecipeImport>,
  ) {
    onChange(
      {
        ...recipe,
        ...changes,
      },
    );
  }


  function updateIngredientGroup(
    groupIndex:
      number,

    changes:
      Partial<AiRecipeIngredientGroup>,
  ) {
    const groups =
      recipe.ingredientGroups.map(
        (
          group,
          index,
        ) =>
          index ===
          groupIndex
            ? {
                ...group,
                ...changes,
              }
            : group,
      );


    updateRecipe(
      {
        ingredientGroups:
          groups,
      },
    );
  }


  function addIngredientGroup() {
    updateRecipe(
      {
        ingredientGroups: [
          ...recipe.ingredientGroups,

          {
            name:
              null,

            ingredients:
              [],
          },
        ],
      },
    );
  }


  function removeIngredientGroup(
    groupIndex:
      number,
  ) {
    updateRecipe(
      {
        ingredientGroups:
          recipe.ingredientGroups.filter(
            (
              _group,
              index,
            ) =>
              index !==
              groupIndex,
          ),
      },
    );
  }


  function updateIngredient(
    groupIndex:
      number,

    ingredientIndex:
      number,

    changes:
      Partial<AiRecipeIngredient>,
  ) {
    const groups =
      recipe.ingredientGroups.map(
        (
          group,
          currentGroupIndex,
        ) => {
          if (
            currentGroupIndex !==
            groupIndex
          ) {
            return group;
          }


          return {
            ...group,

            ingredients:
              group.ingredients.map(
                (
                  ingredient,
                  currentIngredientIndex,
                ) =>
                  currentIngredientIndex ===
                  ingredientIndex
                    ? {
                        ...ingredient,
                        ...changes,
                      }
                    : ingredient,
              ),
          };
        },
      );


    updateRecipe(
      {
        ingredientGroups:
          groups,
      },
    );
  }


  function addIngredient(
    groupIndex:
      number,
  ) {
    const groups =
      recipe.ingredientGroups.map(
        (
          group,
          index,
        ) => {
          if (
            index !==
            groupIndex
          ) {
            return group;
          }


          return {
            ...group,

            ingredients: [
              ...group.ingredients,

              {
                quantity:
                  null,

                unit:
                  null,

                name:
                  "",

                notes:
                  null,

                scalable:
                  true,
              },
            ],
          };
        },
      );


    updateRecipe(
      {
        ingredientGroups:
          groups,
      },
    );
  }


  function removeIngredient(
    groupIndex:
      number,

    ingredientIndex:
      number,
  ) {
    const groups =
      recipe.ingredientGroups.map(
        (
          group,
          index,
        ) => {
          if (
            index !==
            groupIndex
          ) {
            return group;
          }


          return {
            ...group,

            ingredients:
              group.ingredients.filter(
                (
                  _ingredient,
                  currentIngredientIndex,
                ) =>
                  currentIngredientIndex !==
                  ingredientIndex,
              ),
          };
        },
      );


    updateRecipe(
      {
        ingredientGroups:
          groups,
      },
    );
  }


  function updateStep(
    stepIndex:
      number,

    changes:
      Partial<AiRecipeStep>,
  ) {
    updateRecipe(
      {
        steps:
          recipe.steps.map(
            (
              step,
              index,
            ) =>
              index ===
              stepIndex
                ? {
                    ...step,
                    ...changes,
                  }
                : step,
          ),
      },
    );
  }


  function addStep() {
    updateRecipe(
      {
        steps: [
          ...recipe.steps,

          {
            title:
              null,

            instructions:
              "",

            durationMinutes:
              null,

            tip:
              null,
          },
        ],
      },
    );
  }


  function removeStep(
    stepIndex:
      number,
  ) {
    updateRecipe(
      {
        steps:
          recipe.steps.filter(
            (
              _step,
              index,
            ) =>
              index !==
              stepIndex,
          ),
      },
    );
  }


  function updateAllergen(
    allergenIndex:
      number,

    changes:
      Partial<AiRecipeAllergen>,
  ) {
    updateRecipe(
      {
        allergens:
          recipe.allergens.map(
            (
              allergen,
              index,
            ) =>
              index ===
              allergenIndex
                ? {
                    ...allergen,
                    ...changes,
                  }
                : allergen,
          ),
      },
    );
  }


  function addAllergen() {
    updateRecipe(
      {
        allergens: [
          ...recipe.allergens,

          {
            name:
              "",

            presence:
              "present",

            explicitlyMentioned:
              true,
          },
        ],
      },
    );
  }


  function removeAllergen(
    allergenIndex:
      number,
  ) {
    updateRecipe(
      {
        allergens:
          recipe.allergens.filter(
            (
              _allergen,
              index,
            ) =>
              index !==
              allergenIndex,
          ),
      },
    );
  }


  return (
    <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <Bot
          className="mt-1 h-6 w-6 shrink-0 text-brand"
          aria-hidden="true"
        />

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
            Revisión humana
          </p>

          <h2 className="mt-1 font-serif text-3xl font-bold text-foreground">
            Revisa la receta detectada
          </h2>

          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            Gemini ha preparado
            estos datos, pero
            todavía no se ha
            guardado ninguna
            receta. Corrige todo
            lo que necesites antes
            de crear el borrador.
          </p>
        </div>
      </div>


      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-secondary/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Confianza IA
          </p>

          <p className="mt-2 font-semibold text-foreground">
            {getConfidenceLabel(
              recipe.confidence,
            )}
          </p>
        </div>


        <div className="rounded-xl bg-secondary/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Ingredientes
          </p>

          <p className="mt-2 font-semibold text-foreground">
            {recipe.ingredientGroups.reduce(
              (
                total,
                group,
              ) =>
                total +
                group.ingredients.length,
              0,
            )}
          </p>
        </div>


        <div className="rounded-xl bg-secondary/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Pasos
          </p>

          <p className="mt-2 font-semibold text-foreground">
            {
              recipe.steps
                .length
            }
          </p>
        </div>
      </div>


      {recipe.uncertainFields.length >
      0 ? (
        <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-5">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <TriangleAlert
              className="h-5 w-5 text-brand"
              aria-hidden="true"
            />

            Campos que necesitan revisión
          </div>


          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {recipe.uncertainFields.map(
              (
                field,
              ) => (
                <li
                  key={
                    field
                  }
                >
                  •{" "}
                  {
                    field
                  }
                </li>
              ),
            )}
          </ul>
        </div>
      ) : null}


      {recipe.warnings.length >
      0 ? (
        <div className="mt-4 rounded-xl border border-border bg-secondary/40 p-5">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <CircleAlert
              className="h-5 w-5 text-brand"
              aria-hidden="true"
            />

            Advertencias de la IA
          </div>


          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            {recipe.warnings.map(
              (
                warning,
              ) => (
                <li
                  key={
                    warning
                  }
                >
                  •{" "}
                  {
                    warning
                  }
                </li>
              ),
            )}
          </ul>
        </div>
      ) : null}


      <div className="mt-10 space-y-12">
        <section>
          <h3 className="font-serif text-2xl font-bold text-foreground">
            Información básica
          </h3>


          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label
                htmlFor="ai-title"
                className="text-sm font-semibold text-foreground"
              >
                Título
              </label>

              <input
                id="ai-title"
                type="text"
                value={
                  recipe.title ??
                  ""
                }
                onChange={
                  (
                    event,
                  ) =>
                    updateRecipe(
                      {
                        title:
                          stringToNullable(
                            event
                              .target
                              .value,
                          ),
                      },
                    )
                }
                className="mt-2 min-h-11 w-full rounded-xl border border-border bg-white px-4 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>


            <div className="md:col-span-2">
              <label
                htmlFor="ai-short-description"
                className="text-sm font-semibold text-foreground"
              >
                Descripción corta
              </label>

              <textarea
                id="ai-short-description"
                rows={
                  2
                }
                value={
                  recipe.shortDescription ??
                  ""
                }
                onChange={
                  (
                    event,
                  ) =>
                    updateRecipe(
                      {
                        shortDescription:
                          stringToNullable(
                            event
                              .target
                              .value,
                          ),
                      },
                    )
                }
                className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>


            <div className="md:col-span-2">
              <label
                htmlFor="ai-introduction"
                className="text-sm font-semibold text-foreground"
              >
                Introducción
              </label>

              <textarea
                id="ai-introduction"
                rows={
                  4
                }
                value={
                  recipe.introduction ??
                  ""
                }
                onChange={
                  (
                    event,
                  ) =>
                    updateRecipe(
                      {
                        introduction:
                          stringToNullable(
                            event
                              .target
                              .value,
                          ),
                      },
                    )
                }
                className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>


            <div>
              <label
                htmlFor="ai-servings"
                className="text-sm font-semibold text-foreground"
              >
                Raciones
              </label>

              <input
                id="ai-servings"
                type="number"
                min={
                  1
                }
                step={
                  1
                }
                value={
                  recipe.baseServings ??
                  ""
                }
                onChange={
                  (
                    event,
                  ) =>
                    updateRecipe(
                      {
                        baseServings:
                          parseNullableInteger(
                            event
                              .target
                              .value,
                          ),
                      },
                    )
                }
                className="mt-2 min-h-11 w-full rounded-xl border border-border bg-white px-4 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>


            <div>
              <label
                htmlFor="ai-difficulty"
                className="text-sm font-semibold text-foreground"
              >
                Dificultad
              </label>

              <select
                id="ai-difficulty"
                value={
                  recipe.difficulty ??
                  ""
                }
                onChange={
                  (
                    event,
                  ) =>
                    updateRecipe(
                      {
                        difficulty:
                          event
                            .target
                            .value
                            ? (
                                event
                                  .target
                                  .value as AiRecipeImport["difficulty"]
                              )
                            : null,
                      },
                    )
                }
                className="mt-2 min-h-11 w-full rounded-xl border border-border bg-white px-4 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                <option value="">
                  No indicada
                </option>

                <option value="easy">
                  Fácil
                </option>

                <option value="medium">
                  Media
                </option>

                <option value="hard">
                  Difícil
                </option>
              </select>
            </div>


            <div>
              <label
                htmlFor="ai-preparation-minutes"
                className="text-sm font-semibold text-foreground"
              >
                Preparación
              </label>

              <input
                id="ai-preparation-minutes"
                type="number"
                min={
                  0
                }
                step={
                  1
                }
                value={
                  recipe.preparationMinutes ??
                  ""
                }
                onChange={
                  (
                    event,
                  ) =>
                    updateRecipe(
                      {
                        preparationMinutes:
                          parseNullableInteger(
                            event
                              .target
                              .value,
                          ),
                      },
                    )
                }
                placeholder="Minutos"
                className="mt-2 min-h-11 w-full rounded-xl border border-border bg-white px-4 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>


            <div>
              <label
                htmlFor="ai-cooking-minutes"
                className="text-sm font-semibold text-foreground"
              >
                Cocción
              </label>

              <input
                id="ai-cooking-minutes"
                type="number"
                min={
                  0
                }
                step={
                  1
                }
                value={
                  recipe.cookingMinutes ??
                  ""
                }
                onChange={
                  (
                    event,
                  ) =>
                    updateRecipe(
                      {
                        cookingMinutes:
                          parseNullableInteger(
                            event
                              .target
                              .value,
                          ),
                      },
                    )
                }
                placeholder="Minutos"
                className="mt-2 min-h-11 w-full rounded-xl border border-border bg-white px-4 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>


            <div>
              <label
                htmlFor="ai-additional-minutes"
                className="text-sm font-semibold text-foreground"
              >
                Tiempo adicional
              </label>

              <input
                id="ai-additional-minutes"
                type="number"
                min={
                  0
                }
                step={
                  1
                }
                value={
                  recipe.additionalMinutes ??
                  ""
                }
                onChange={
                  (
                    event,
                  ) =>
                    updateRecipe(
                      {
                        additionalMinutes:
                          parseNullableInteger(
                            event
                              .target
                              .value,
                          ),
                      },
                    )
                }
                placeholder="Minutos"
                className="mt-2 min-h-11 w-full rounded-xl border border-border bg-white px-4 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
          </div>
        </section>


        <section>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-serif text-2xl font-bold text-foreground">
              Ingredientes
            </h3>


            <button
              type="button"
              onClick={
                addIngredientGroup
              }
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-foreground hover:bg-secondary"
            >
              <Plus
                className="h-4 w-4"
                aria-hidden="true"
              />

              Añadir grupo
            </button>
          </div>


          <div className="mt-5 space-y-6">
            {recipe.ingredientGroups.map(
              (
                group,
                groupIndex,
              ) => (
                <div
                  key={
                    `group-${groupIndex}`
                  }
                  className="rounded-2xl border border-border bg-secondary/20 p-5"
                >
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={
                        group.name ??
                        ""
                      }
                      onChange={
                        (
                          event,
                        ) =>
                          updateIngredientGroup(
                            groupIndex,
                            {
                              name:
                                stringToNullable(
                                  event
                                    .target
                                    .value,
                                ),
                            },
                          )
                      }
                      placeholder="Nombre del grupo (opcional)"
                      className="min-h-11 flex-1 rounded-xl border border-border bg-white px-4 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />


                    <button
                      type="button"
                      onClick={
                        () =>
                          removeIngredientGroup(
                            groupIndex,
                          )
                      }
                      aria-label="Eliminar grupo"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-white text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <Trash2
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </button>
                  </div>


                  <div className="mt-5 space-y-4">
                    {group.ingredients.map(
                      (
                        ingredient,
                        ingredientIndex,
                      ) => (
                        <div
                          key={
                            `ingredient-${groupIndex}-${ingredientIndex}`
                          }
                          className="rounded-xl border border-border bg-white p-4"
                        >
                          <div className="grid gap-3 sm:grid-cols-[110px_110px_minmax(0,1fr)_44px]">
                            <input
                              type="number"
                              step="any"
                              value={
                                ingredient.quantity ??
                                ""
                              }
                              onChange={
                                (
                                  event,
                                ) =>
                                  updateIngredient(
                                    groupIndex,
                                    ingredientIndex,
                                    {
                                      quantity:
                                        parseNullableNumber(
                                          event
                                            .target
                                            .value,
                                        ),
                                    },
                                  )
                              }
                              placeholder="Cantidad"
                              className="min-h-11 rounded-xl border border-border px-3 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                            />


                            <input
                              type="text"
                              value={
                                ingredient.unit ??
                                ""
                              }
                              onChange={
                                (
                                  event,
                                ) =>
                                  updateIngredient(
                                    groupIndex,
                                    ingredientIndex,
                                    {
                                      unit:
                                        stringToNullable(
                                          event
                                            .target
                                            .value,
                                        ),
                                    },
                                  )
                              }
                              placeholder="Unidad"
                              className="min-h-11 rounded-xl border border-border px-3 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                            />


                            <input
                              type="text"
                              value={
                                ingredient.name
                              }
                              onChange={
                                (
                                  event,
                                ) =>
                                  updateIngredient(
                                    groupIndex,
                                    ingredientIndex,
                                    {
                                      name:
                                        event
                                          .target
                                          .value,
                                    },
                                  )
                              }
                              placeholder="Ingrediente"
                              className="min-h-11 rounded-xl border border-border px-3 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                            />


                            <button
                              type="button"
                              onClick={
                                () =>
                                  removeIngredient(
                                    groupIndex,
                                    ingredientIndex,
                                  )
                              }
                              aria-label="Eliminar ingrediente"
                              className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                            >
                              <Trash2
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            </button>
                          </div>


                          <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
                            <input
                              type="text"
                              value={
                                ingredient.notes ??
                                ""
                              }
                              onChange={
                                (
                                  event,
                                ) =>
                                  updateIngredient(
                                    groupIndex,
                                    ingredientIndex,
                                    {
                                      notes:
                                        stringToNullable(
                                          event
                                            .target
                                            .value,
                                        ),
                                    },
                                  )
                              }
                              placeholder="Notas: al gusto, picado..."
                              className="min-h-11 rounded-xl border border-border px-3 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                            />


                            <label className="flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm text-foreground">
                              <input
                                type="checkbox"
                                checked={
                                  ingredient.scalable
                                }
                                onChange={
                                  (
                                    event,
                                  ) =>
                                    updateIngredient(
                                      groupIndex,
                                      ingredientIndex,
                                      {
                                        scalable:
                                          event
                                            .target
                                            .checked,
                                      },
                                    )
                                }
                              />

                              Escalable
                            </label>
                          </div>
                        </div>
                      ),
                    )}
                  </div>


                  <button
                    type="button"
                    onClick={
                      () =>
                        addIngredient(
                          groupIndex,
                        )
                    }
                    className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-foreground hover:bg-secondary"
                  >
                    <Plus
                      className="h-4 w-4"
                      aria-hidden="true"
                    />

                    Añadir ingrediente
                  </button>
                </div>
              ),
            )}
          </div>
        </section>


        <section>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-serif text-2xl font-bold text-foreground">
              Elaboración
            </h3>


            <button
              type="button"
              onClick={
                addStep
              }
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-foreground hover:bg-secondary"
            >
              <Plus
                className="h-4 w-4"
                aria-hidden="true"
              />

              Añadir paso
            </button>
          </div>


          <div className="mt-5 space-y-5">
            {recipe.steps.map(
              (
                step,
                stepIndex,
              ) => (
                <div
                  key={
                    `step-${stepIndex}`
                  }
                  className="rounded-2xl border border-border bg-secondary/20 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-serif text-xl font-bold text-foreground">
                      Paso{" "}
                      {
                        stepIndex +
                        1
                      }
                    </p>


                    <button
                      type="button"
                      onClick={
                        () =>
                          removeStep(
                            stepIndex,
                          )
                      }
                      aria-label="Eliminar paso"
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <Trash2
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </button>
                  </div>


                  <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
                    <input
                      type="text"
                      value={
                        step.title ??
                        ""
                      }
                      onChange={
                        (
                          event,
                        ) =>
                          updateStep(
                            stepIndex,
                            {
                              title:
                                stringToNullable(
                                  event
                                    .target
                                    .value,
                                ),
                            },
                          )
                      }
                      placeholder="Título del paso (opcional)"
                      className="min-h-11 rounded-xl border border-border bg-white px-4 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />


                    <input
                      type="number"
                      min={
                        0
                      }
                      step={
                        1
                      }
                      value={
                        step.durationMinutes ??
                        ""
                      }
                      onChange={
                        (
                          event,
                        ) =>
                          updateStep(
                            stepIndex,
                            {
                              durationMinutes:
                                parseNullableInteger(
                                  event
                                    .target
                                    .value,
                                ),
                            },
                          )
                      }
                      placeholder="Minutos"
                      className="min-h-11 rounded-xl border border-border bg-white px-4 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </div>


                  <textarea
                    rows={
                      4
                    }
                    value={
                      step.instructions
                    }
                    onChange={
                      (
                        event,
                      ) =>
                        updateStep(
                          stepIndex,
                          {
                            instructions:
                              event
                                .target
                                .value,
                          },
                        )
                    }
                    placeholder="Instrucciones"
                    className="mt-4 w-full rounded-xl border border-border bg-white px-4 py-3 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />


                  <textarea
                    rows={
                      2
                    }
                    value={
                      step.tip ??
                      ""
                    }
                    onChange={
                      (
                        event,
                      ) =>
                        updateStep(
                          stepIndex,
                          {
                            tip:
                              stringToNullable(
                                event
                                  .target
                                  .value,
                              ),
                          },
                        )
                    }
                    placeholder="Consejo del paso (opcional)"
                    className="mt-4 w-full rounded-xl border border-border bg-white px-4 py-3 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </div>
              ),
            )}
          </div>
        </section>


        <section>
          <h3 className="font-serif text-2xl font-bold text-foreground">
            Clasificación sugerida
          </h3>


          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <div>
              <label className="text-sm font-semibold text-foreground">
                Tipo de receta
              </label>

              <input
                type="text"
                value={
                  recipe
                    .classification
                    .recipeType ??
                  ""
                }
                onChange={
                  (
                    event,
                  ) =>
                    updateRecipe(
                      {
                        classification: {
                          ...recipe.classification,

                          recipeType:
                            stringToNullable(
                              event
                                .target
                                .value,
                            ),
                        },
                      },
                    )
                }
                className="mt-2 min-h-11 w-full rounded-xl border border-border bg-white px-4 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>


            <div>
              <label className="text-sm font-semibold text-foreground">
                Categorías
              </label>

              <input
                type="text"
                value={
                  arrayToText(
                    recipe
                      .classification
                      .categories,
                  )
                }
                onChange={
                  (
                    event,
                  ) =>
                    updateRecipe(
                      {
                        classification: {
                          ...recipe.classification,

                          categories:
                            textToArray(
                              event
                                .target
                                .value,
                            ),
                        },
                      },
                    )
                }
                placeholder="Pasta, Postres..."
                className="mt-2 min-h-11 w-full rounded-xl border border-border bg-white px-4 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>


            <div>
              <label className="text-sm font-semibold text-foreground">
                Etiquetas
              </label>

              <input
                type="text"
                value={
                  arrayToText(
                    recipe
                      .classification
                      .tags,
                  )
                }
                onChange={
                  (
                    event,
                  ) =>
                    updateRecipe(
                      {
                        classification: {
                          ...recipe.classification,

                          tags:
                            textToArray(
                              event
                                .target
                                .value,
                            ),
                        },
                      },
                    )
                }
                placeholder="Horno, Fácil..."
                className="mt-2 min-h-11 w-full rounded-xl border border-border bg-white px-4 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
          </div>
        </section>


        <section>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-serif text-2xl font-bold text-foreground">
              Alérgenos
            </h3>


            <button
              type="button"
              onClick={
                addAllergen
              }
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-foreground hover:bg-secondary"
            >
              <Plus
                className="h-4 w-4"
                aria-hidden="true"
              />

              Añadir alérgeno
            </button>
          </div>


          {recipe.allergens.length >
          0 ? (
            <div className="mt-5 space-y-3">
              {recipe.allergens.map(
                (
                  allergen,
                  allergenIndex,
                ) => (
                  <div
                    key={
                      `allergen-${allergenIndex}`
                    }
                    className="grid gap-3 rounded-xl border border-border bg-secondary/20 p-4 sm:grid-cols-[minmax(0,1fr)_180px_44px]"
                  >
                    <input
                      type="text"
                      value={
                        allergen.name
                      }
                      onChange={
                        (
                          event,
                        ) =>
                          updateAllergen(
                            allergenIndex,
                            {
                              name:
                                event
                                  .target
                                  .value,
                            },
                          )
                      }
                      placeholder="Alérgeno"
                      className="min-h-11 rounded-xl border border-border bg-white px-4 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />


                    <select
                      value={
                        allergen.presence
                      }
                      onChange={
                        (
                          event,
                        ) =>
                          updateAllergen(
                            allergenIndex,
                            {
                              presence:
                                event
                                  .target
                                  .value as AiRecipeAllergen["presence"],
                            },
                          )
                      }
                      className="min-h-11 rounded-xl border border-border bg-white px-4 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    >
                      <option value="present">
                        Contiene
                      </option>

                      <option value="possible">
                        Puede contener
                      </option>
                    </select>


                    <button
                      type="button"
                      onClick={
                        () =>
                          removeAllergen(
                            allergenIndex,
                          )
                      }
                      aria-label="Eliminar alérgeno"
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <Trash2
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                ),
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              La imagen no
              indica alérgenos
              explícitamente.
            </p>
          )}
        </section>


        <section>
          <h3 className="font-serif text-2xl font-bold text-foreground">
            Fuente
          </h3>


          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-foreground">
                Tipo
              </label>

              <select
                value={
                  recipe.source
                    .type ??
                  ""
                }
                onChange={
                  (
                    event,
                  ) =>
                    updateRecipe(
                      {
                        source: {
                          ...recipe.source,

                          type:
                            event
                              .target
                              .value
                              ? (
                                  event
                                    .target
                                    .value as AiRecipeImport["source"]["type"]
                                )
                              : null,
                        },
                      },
                    )
                }
                className="mt-2 min-h-11 w-full rounded-xl border border-border bg-white px-4 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                <option value="">
                  No indicada
                </option>

                <option value="own">
                  Propia
                </option>

                <option value="family">
                  Familiar
                </option>

                <option value="book">
                  Libro
                </option>

                <option value="magazine">
                  Revista
                </option>

                <option value="web">
                  Web
                </option>

                <option value="handwritten">
                  Manuscrita
                </option>

                <option value="other">
                  Otra
                </option>
              </select>
            </div>


            <div>
              <label className="text-sm font-semibold text-foreground">
                Título de la fuente
              </label>

              <input
                type="text"
                value={
                  recipe.source
                    .title ??
                  ""
                }
                onChange={
                  (
                    event,
                  ) =>
                    updateRecipe(
                      {
                        source: {
                          ...recipe.source,

                          title:
                            stringToNullable(
                              event
                                .target
                                .value,
                            ),
                        },
                      },
                    )
                }
                className="mt-2 min-h-11 w-full rounded-xl border border-border bg-white px-4 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>


            <div>
              <label className="text-sm font-semibold text-foreground">
                Autor
              </label>

              <input
                type="text"
                value={
                  recipe.source
                    .author ??
                  ""
                }
                onChange={
                  (
                    event,
                  ) =>
                    updateRecipe(
                      {
                        source: {
                          ...recipe.source,

                          author:
                            stringToNullable(
                              event
                                .target
                                .value,
                            ),
                        },
                      },
                    )
                }
                className="mt-2 min-h-11 w-full rounded-xl border border-border bg-white px-4 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>


            <div>
              <label className="text-sm font-semibold text-foreground">
                Página
              </label>

              <input
                type="text"
                value={
                  recipe.source
                    .page ??
                  ""
                }
                onChange={
                  (
                    event,
                  ) =>
                    updateRecipe(
                      {
                        source: {
                          ...recipe.source,

                          page:
                            stringToNullable(
                              event
                                .target
                                .value,
                            ),
                        },
                      },
                    )
                }
                className="mt-2 min-h-11 w-full rounded-xl border border-border bg-white px-4 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>


            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-foreground">
                URL
              </label>

              <input
                type="url"
                value={
                  recipe.source
                    .url ??
                  ""
                }
                onChange={
                  (
                    event,
                  ) =>
                    updateRecipe(
                      {
                        source: {
                          ...recipe.source,

                          url:
                            stringToNullable(
                              event
                                .target
                                .value,
                            ),
                        },
                      },
                    )
                }
                className="mt-2 min-h-11 w-full rounded-xl border border-border bg-white px-4 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>


            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-foreground">
                Notas sobre la fuente
              </label>

              <textarea
                rows={
                  3
                }
                value={
                  recipe.source
                    .notes ??
                  ""
                }
                onChange={
                  (
                    event,
                  ) =>
                    updateRecipe(
                      {
                        source: {
                          ...recipe.source,

                          notes:
                            stringToNullable(
                              event
                                .target
                                .value,
                            ),
                        },
                      },
                    )
                }
                className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
          </div>
        </section>


        {recipe.rawText ? (
          <details className="rounded-xl border border-border bg-secondary/20 p-5">
            <summary className="cursor-pointer font-semibold text-foreground">
              Ver texto detectado
              por la IA
            </summary>

            <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-6 text-muted-foreground">
              {
                recipe.rawText
              }
            </pre>
          </details>
        ) : null}
      </div>


      <div className="mt-10 rounded-2xl border border-border bg-secondary/40 p-5">
        <p className="font-semibold text-foreground">
          Todavía no se ha
          guardado nada
        </p>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Puedes modificar
          libremente estos datos.
          En el siguiente paso
          añadiremos el botón
          para crear un borrador
          real de CociHub usando
          exactamente esta
          información revisada.
        </p>
      </div>
    </section>
  );
}